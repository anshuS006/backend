const User = require('../models/user.model');  // User model
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // For password hashing
const ApiResponse = require('../utils/ApiResponse'); // Import the ApiResponse class
const ApiError = require('../utils/ApiError'); // Custom error handler

// Helper function to hash passwords
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Helper function to compare passwords
const comparePassword = async (inputPassword, storedPassword) => {
    return await bcrypt.compare(inputPassword, storedPassword);
};

// **Register a New User (Public Registration)**
exports.registerUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if required fields are provided
        if (!email || !password) {
            throw new ApiError(400, 'Email and password are required');
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ApiError(400, 'User with this email already exists');
        }

        // Hash password before storing
        const hashedPassword = await hashPassword(password);

        // Create a new user (default role: 'user')
        const newUser = new User({
            email,
            password: hashedPassword,
            role: 'user' // Default role for public registration
        });

        // Save the user to the database
        await newUser.save();

        // Return response
        const response = new ApiResponse(201, {
            email: newUser.email,
            id: newUser._id,
            role: newUser.role
        }, 'User registered successfully!');
        res.status(201).json(response);

    } catch (err) {
        next(err instanceof ApiError ? err : new ApiError(500, err.message));
    }
};

// **Register an Admin or Author (Restricted to Super Admin)**
exports.registerAdmin = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;
        const requester = req.user; // Authenticated user

        // Check if required fields are provided
        if (!email || !password || !role) {
            throw new ApiError(400, 'Email, password, and role are required');
        }

        // Allowed roles for creation
        if (!['admin', 'author'].includes(role)) {
            throw new ApiError(400, 'Invalid role. Only admin or author can be created');
        }

        // Authorization rules:
        if (requester.role !== 'super_admin' && requester.role !== 'admin' ) {
            throw new ApiError(403, 'Unauthorized: Only super admins can create admins or authors');
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ApiError(400, 'User with this email already exists');
        }

        // Hash password before storing
        const hashedPassword = await hashPassword(password);

        // Create a new user
        const newUser = new User({
            email,
            password: hashedPassword,
            role
        });

        // Save the user to the database
        await newUser.save();

        // Return response
        const response = new ApiResponse(201, {
            email: newUser.email,
            id: newUser._id,
            role: newUser.role
        }, 'User registered successfully!');
        res.status(201).json(response);

    } catch (err) {
        next(err instanceof ApiError ? err : new ApiError(500, err.message));
    }
};

// Login user
exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if the email and password are provided
        if (!email || !password) {
            throw new ApiError(400, 'Email and password are required');
        }

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
         // Check if user is active
         if (!user.active) {
            throw new ApiError(403, 'User account is deactivated. Please contact support.');
        }
        // Validate password
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            throw new ApiError(400, 'Incorrect password');
        }

        // Check if the password matches (using plain password as per your request)
        // if (user.password !== password) {
        //     throw new ApiError(400, 'Incorrect password');
        // }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '288h' }  // Token expires in 1 hour
        );

        // Return the token in the response
        const response = new ApiResponse(200, { token, role: user.role }, 'Login successful');
        res.status(200).json(response);
    } catch (err) {
        next(err instanceof ApiError ? err : new ApiError(500, err.message));
    }
};

// Get list of all admins (Only accessible by Super Admin)
exports.getAdminList = async (req, res, next) => {
    try {
        // Fetch all users with role 'admin'
        const admins = await User.find({ role: 'admin' }).select('-password'); // Exclude password from response

        if (!admins.length) {
            throw new ApiError(404, 'No admins found');
        }

        // Send response
        const response = new ApiResponse(200, admins, 'Admin list retrieved successfully');
        res.status(200).json(response);
    } catch (err) {
        next(err instanceof ApiError ? err : new ApiError(500, err.message));
    }
};
// Get list of all users (Only accessible by Super Admin and Admin)
exports.getUserList = async (req, res, next) => {
    try {
        // Fetch all users except super_admin
        const users = await User.find({ role: { $in: ['user'] } }).select('-password'); // Exclude password

        if (!users.length) {
            throw new ApiError(404, 'No users found');
        }

        // Send response
        const response = new ApiResponse(200, users, 'User list retrieved successfully');
        res.status(200).json(response);
    } catch (err) {
        next(err instanceof ApiError ? err : new ApiError(500, err.message));
    }
};
exports.toggleUserActiveStatus = async (req, res, next) => {
    try {
        const { userId } = req.body; // Get user ID from request body
        const requester = req.user; // Logged-in user

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        // Prevent non-super_admins from deactivating admins
        if (user.role === 'admin' && requester.role !== 'super_admin') {
            throw new ApiError(403, 'Only Super Admin can change Admin status');
        }

        // Toggle active status
        user.active = !user.active;
        await user.save();

        const statusMessage = user.active ? 'User activated successfully' : 'User deactivated successfully';
        const response = new ApiResponse(200, { id: user._id, active: user.active }, statusMessage);
        res.status(200).json(response);
    } catch (err) {
        next(err instanceof ApiError ? err : new ApiError(500, err.message));
    }
};
exports.changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.userId; // Authenticated user's ID

        // Validate inputs
        if (!oldPassword || !newPassword) {
            throw new ApiError(400, 'Old password and new password are required');
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        // Check if old password is correct
        const isMatch = await comparePassword(oldPassword, user.password);
        if (!isMatch) {
            throw new ApiError(400, 'Incorrect old password');
        }

        // Hash the new password
        const hashedPassword = await hashPassword(newPassword);
        user.password = hashedPassword;
        await user.save();

        // Send success response
        const response = new ApiResponse(200, null, 'Password changed successfully');
        res.status(200).json(response);
    } catch (err) {
        next(err instanceof ApiError ? err : new ApiError(500, err.message));
    }
};
exports.subscribeToAuthor = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const author = await User.findById(req.params.id);

        if (!author || author.role !== "author") {
            return res.status(404).json({ message: "Author not found" });
        }

        if (!user.subscriptions.includes(author.id)) {
            user.subscriptions.push(author.id);
            await user.save();
            return res.json({ message: `Subscribed to ${author.email}` });
        }

        res.json({ message: "Already subscribed" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// **Unsubscribe from an Author**
exports.unsubscribeFromAuthor = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        user.subscriptions = user.subscriptions.filter((id) => id.toString() !== req.params.id);
        await user.save();

        res.json({ message: "Unsubscribed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};