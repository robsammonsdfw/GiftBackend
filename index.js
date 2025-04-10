const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const AWS = require("aws-sdk");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const app = express();
require("dotenv").config();

const PORT = 3000;
const cors = require("cors");
app.use(cors({
  origin: '*', // Allow all origins - be cautious with this in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

app.use(express.json());

app.get("/giftit", (req, res) => {
    res.send("GiftIt");
  });
  
  app.get("/", (req, res) => {
    console.log(req.body);
    res.send("GiftIt");
  });
  
  app.post("/", (req, res) => {
    res.send("GiftIt");
  });
  
  app.listen(PORT, () => {
    console.log("port is running", PORT);
  });

  require("./middleware/bd");
dotenv.config();

  const createToken = (userId) => {
    //set the token payload
    const payload = {
      userId: userId,
    };
  
    //generate the token with a secret key and expire time
    const token = jwt.sign(payload, "Qedji3z2ndj", { expiresIn: "1h" });
  
    return token;
  };

  const User = require("./models/user");





  app.post("/check-username", async (req, res) => {
    const { username } = req.body;
  
    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "Username already in use" });
      }
      res.status(200).json({ message: "Username available" });
    } catch (error) {
      console.log("Error checking username:", error);
      res.status(500).json({ message: "Error checking username" });
    }
  });
  
  app.post("/check-email", async (req, res) => {
    const { email } = req.body;
  
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email in use" });
      }
      res.status(200).json({ message: "Email available" });
    } catch (error) {
      console.log("Error checking email:", error);
      res.status(500).json({ message: "Error checking email" });
    }
  });

  app.post("/create-user", async (req, res) => {
    try {
      const { username, name, email, password, age } = req.body;
  
      // Basic validation
      if (!username || !name || !email || !password || !age) {
        return res.status(400).json({
          message: "Please provide all required fields"
        });
      }
  
      // Check if username already exists
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({
          message: "Username already exists"
        });
      }
  
      // Check if email already exists
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          message: "Email already exists"
        }); 
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create new user object
      const newUser = new User({
        username,
        name,
        email,
        password: hashedPassword,
        age: new Date(age), // Convert age to Date object as per schema
        profileImage: "default.jpg", // Set a default profile image
        wallet: {
          balance: 0,
          currency: "USD"
        },
        role: "user",
        status: "active",
        verified: false,
        isEmailVerified: false,
        isPhoneVerified: false
      });
  
      // Save the user to database
      await newUser.save();
  
      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser._id },
        "Qedji3z2ndj", // Using your existing secret key
        { expiresIn: "1h" }
      );
  
      // Return success response with token
      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          name: newUser.name
        }
      });
  
    } catch (error) {
      console.error("Error in user registration:", error);
      res.status(500).json({
        message: "Error creating user",
        error: error.message
      });
    }
  });


  app.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Basic validation
      if (!username || !password) {
        return res.status(400).json({
          message: "Please provide both username and password"
        });
      }
  
      // Find user by username
      const user = await User.findOne({ username });
      
      // Check if user exists
      if (!user) {
        return res.status(401).json({
          message: "Invalid username or password"
        });
      }
  
      // Check if account is active
      if (user.status !== 'active') {
        return res.status(401).json({
          message: "Account is not active. Please contact support."
        });
      }
  
      // Compare password with hashed password in database
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Invalid username or password"
        });
      }
  
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        "Qedji3z2ndj",
        { expiresIn: "1h" }
      );
  
      // Update last active timestamp
      user.lastActive = new Date();
      await user.save();
  
      // Return success response with token and user data
      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          profileImage: user.profileImage,
          wallet: user.wallet,
          isEmailVerified: user.isEmailVerified,
          role: user.role
        }
      });
  
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({
        message: "Error during login",
        error: error.message
      });
    }
  });

//   app.get("/api/gift-cards", async (req, res) => {

//     try {
//       const limit = parseInt(req.query.limit) || 20;
//       const cursor = req.query.cursor || null; // Get cursor from query params
      
//       // Build URL with cursor if available
//       let url = `https://playground.runa.io/v2/product?limit=${limit}`;
//       if (cursor) {
//         url += `&after=${cursor}`;
//       }
  
//       const options = {
//         method: 'GET',
//         headers: {
//           accept: 'application/json',
//           'X-Api-Key': 'XXndGrpp.8U-OejLaQ9tRevVG0m!MtUt2DSm!5qNa'
//         }
//       };
  
//       const response = await fetch(url, options);
//       const data = await response.json();
  
//       // Check if we got an error response
//       if (data.type === 'bad_request') {
//         throw new Error(data.message);
//       }
  
//       // Transform the data
//       const transformedData = data.catalog.map(item => ({
//         id: item.code,
//         name: item.name,
//         imageUrl: item?.gift_card?.assets?.card_image_url || '',
//         iconUrl: item?.gift_card?.assets?.icon_image_url || '',
//         currency: item.currency,
//         minValue: item?.gift_card?.denominations?.minimum_value || '0',
//         maxValue: item?.gift_card?.denominations?.maximum_value || '0',
//         availableValues: item?.gift_card?.denominations?.available_list || [],
//         discount: item.discount_multiplier,
//         categories: item.categories || [],
//         isOrderable: item.is_orderable
//       }));
  
//       res.json({
//         products: transformedData,
//         pagination: {
//           nextCursor: data.pagination?.cursors?.after || null,
//           prevCursor: data.pagination?.cursors?.before || null,
//           hasMore: !!data.pagination?.cursors?.after
//         }
//       });
  
//     } catch (error) {
//       console.error("Error fetching gift cards:", error);
//       res.status(500).json({ 
//         message: "Error fetching gift cards",
//         error: error.message 
//       });
//     }
//   });


app.get("/api/gift-cards", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const cursor = req.query.cursor || null;
      
      // Add countries_redeemable_in parameter for US cards only
      let url = `https://playground.runa.io/v2/product?limit=${limit}&countries_redeemable_in=US`;
      if (cursor) {
        url += `&after=${cursor}`;
      }
  
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'X-Api-Key': 'XXndGrpp.8U-OejLaQ9tRevVG0m!MtUt2DSm!5qNa'
        }
      };
  
      const response = await fetch(url, options);
      const data = await response.json();
  
      // Check if we got an error response
      if (data.type === 'bad_request') {
        throw new Error(data.message);
      }
  
      // Transform the data and ensure we only include orderable cards
      const transformedData = data.catalog
        .filter(item => item.is_orderable) // Only include orderable cards
        .map(item => ({
          id: item.code,
          name: item.name,
          imageUrl: item?.gift_card?.assets?.card_image_url || '',
          iconUrl: item?.gift_card?.assets?.icon_image_url || '',
          currency: item.currency,
          minValue: item?.gift_card?.denominations?.minimum_value || 
                   (item?.gift_card?.denominations?.available_list?.[0] || '0'),
          maxValue: item?.gift_card?.denominations?.maximum_value || 
                   (item?.gift_card?.denominations?.available_list?.[item?.gift_card?.denominations?.available_list?.length - 1] || '0'),
          availableValues: item?.gift_card?.denominations?.available_list || [],
          discount: item.discount_multiplier,
          categories: item.categories || [],
          isOrderable: item.is_orderable,
          denominationType: item?.gift_card?.denominations?.type || 'open'
        }));
  
      res.json({
        products: transformedData,
        pagination: {
          nextCursor: data.pagination?.cursors?.after || null,
          prevCursor: data.pagination?.cursors?.before || null,
          hasMore: !!data.pagination?.cursors?.after
        },
        metadata: {
          totalCount: transformedData.length,
          currency: 'USD',
          country: 'US'
        }
      });
  
    } catch (error) {
      console.error("Error fetching gift cards:", error);
      res.status(500).json({ 
        message: "Error fetching gift cards",
        error: error.message 
      });
    }
  });


  app.get("/api/gift-card/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      
      const url = `https://playground.runa.io/v2/product?code=${productId}`;
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'X-Api-Key': 'XXndGrpp.8U-OejLaQ9tRevVG0m!MtUt2DSm!5qNa'
        }
      };
  
      const response = await fetch(url, options);
      const data = await response.json();
  
      if (!data.catalog || data.catalog.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      const product = data.catalog[0];
  
      // Transform the data
      const transformedProduct = {
        id: product.code,
        name: product.name,
        imageUrl: product?.gift_card?.assets?.card_image_url || '',
        iconUrl: product?.gift_card?.assets?.icon_image_url || '',
        currency: product.currency,
        minValue: product?.gift_card?.denominations?.minimum_value || 
                 (product?.gift_card?.denominations?.available_list?.[0] || '0'),
        maxValue: product?.gift_card?.denominations?.maximum_value || 
                 (product?.gift_card?.denominations?.available_list?.[product?.gift_card?.denominations?.available_list?.length - 1] || '0'),
        availableValues: product?.gift_card?.denominations?.available_list || [],
        discount: product.discount_multiplier,
        categories: product.categories || [],
        isOrderable: product.is_orderable,
        denominationType: product?.gift_card?.denominations?.type || 'open',
        description: product?.gift_card?.content_resources?.description_markdown_url || '',
        website: product?.gift_card?.website_url || '',
        balanceCheckUrl: product?.gift_card?.balance_check_url || ''
      };
  
      res.json({ product: transformedProduct });
  
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ 
        message: "Error fetching product",
        error: error.message 
      });
    }
  });