import express from 'express';

import userController from '../controller/userController.js';
import JWTAction from '../middleware/JWTAction.js';
const router = express.Router();

export default function initApiRoute(app) {
   router.use(JWTAction.checkUserJWT);
   /**
    * @swagger
    * tags:
    *   - name: Users
    *     description: User account management
    *   - name: Authentication
    *     description: Authentication and token management
    */

   // Đăng ký
   /**
    * @swagger
    * /api/v1/register:
    *   post:
    *     summary: Register a new user
    *     tags: [Users]
    *     description: Create a new user account
    *     requestBody:
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             required:
    *               - email
    *               - password
    *             properties:
    *               email:
    *                 type: string
    *                 example: "user@example.com"
    *               password:
    *                 type: string
    *                 example: "123456"
    *               username:
    *                 type: string
    *                 example: "User Example"
    *               role:
    *                 type: string
    *                 enum: [user, admin]
    *                 example: "user"
    *               status:
    *                 type: string
    *                 enum: [ACTIVE, UNACTIVE]
    *                 example: "ACTIVE"
    *     responses:
    *       200:
    *         description: User created successfully
    *       500:
    *         description: Error from server
    */
   router.post('/register', userController.handleRegister)

   /**
    * @swagger
    * /api/v1/login:
    *   post:
    *     summary: User login
    *     tags: [Users]
    *     description: Authenticate user and return JWT token
    *     requestBody:
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             required:
    *               - email
    *               - password
    *             properties:
    *               email:
    *                 type: string
    *                 example: "admin@gmail.com"
    *               password:
    *                 type: string
    *                 example: "123456"
    *     responses:
    *       200:
    *         description: Login successful
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 EC:
    *                   type: integer
    *                   example: 0
    *                 EM:
    *                   type: string
    *                   example: "Login success"
    *                 DT:
    *                   type: object
    *                   properties:
    *                     access_token:
    *                       type: string
    *                     role:
    *                       type: string
    *                     email:
    *                       type: string
    *                     username:
    *                       type: string
    *       500:
    *         description: Error from server
    */
   router.post('/login', userController.handleLogin)

   // Lấy thông tin người dùng
   /**
    * @swagger
    * /api/v1/userInfo:
    *   get:
    *     summary: Get user information by ID
    *     tags: [Users]
    *     description: Retrieve specific user info by ID (requires JWT)
    *     security:
    *       - BearerAuth: []
    *     parameters:
    *       - in: query
    *         name: id
    *         required: true
    *         description: User ID
    *         schema:
    *           type: integer
    *           example: 1
    *     responses:
    *       200:
    *         description: Successful response
    *       400:
    *         description: Missing required parameter
    *       401:
    *         description: Unauthorized
    */
   router.get('/userInfo', JWTAction.checkPermission(['user', 'admin']), userController.handleGetUserInfor)

   /**
    * @swagger
    * /api/v1/me:
    *   get:
    *     summary: Get current user information
    *     tags: [Users]
    *     description: Retrieve the current logged-in user's information
    *     security:
    *       - BearerAuth: []
    *     responses:
    *       200:
    *         description: Successful response with user data
    *       401:
    *         description: Unauthorized or invalid token
    */
   router.get(
      '/me',
      JWTAction.checkPermission(['user', 'admin']),
      userController.handleGetCurrentUser
   );

   /**
    * @swagger
    * /api/v1/user/updateProfile:
    *   put:
    *     summary: Update current user's profile
    *     tags: [Users]
    *     description: Update current user's username and teleChatID
    *     security:
    *       - BearerAuth: []
    *     requestBody:
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             properties:
    *               username:
    *                 type: string
    *                 example: "New Username"
    *               teleChatID:
    *                 type: string
    *                 example: "123456789"
    *     responses:
    *       200:
    *         description: Update result
    *       401:
    *         description: Unauthorized
    */
   router.put(
      '/user/updateProfile',
      JWTAction.checkPermission(['user', 'admin']),
      userController.handleUpdateCurrentUserProfile
   );

   // Lấy tất cả thông tin người dùng
   /**
    * @swagger
    * /api/v1/allUser:
    *   get:
    *     summary: Get all users (admin only)
    *     tags: [Users]
    *     security:
    *       - BearerAuth: []
    *     responses:
    *       200:
    *         description: List of all users
    *       401:
    *         description: Unauthorized
    */
   router.get('/allUser', JWTAction.checkPermission(['admin']), userController.handleAllUser)

   /**
    * @swagger
    * /api/v1/logout:
    *   post:
    *     summary: Logout
    *     tags: [Authentication]
    *     description: Logout of current account
    *     responses:
    *       200:
    *         description: User logged out successfully
    *       401:
    *         description: Unauthorized
    */
   router.post('/logout', JWTAction.checkPermission(['user', 'admin']), userController.handleLogout)

   // Thêm người dùng mới 
   /**
    * @swagger
    * /api/v1/user/admin/createNewUser:
    *   post:
    *     summary: Create a new user (admin only)
    *     description: Allows admin to create a new user account with email, username, password, role, and status.
    *     tags: [User]
    *     security:
    *       - BearerAuth: []
    *     requestBody:
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             required:
    *               - email
    *               - password
    *               - username
    *               - role
    *             properties:
    *               email:
    *                 type: string
    *                 format: email
    *                 example: "newuser@example.com"
    *               password:
    *                 type: string
    *                 minLength: 6
    *                 example: "strongPassword123"
    *               username:
    *                 type: string
    *                 example: "New User"
    *               role:
    *                 type: string
    *                 enum: [user, admin]
    *                 example: "user"
    *               status:
    *                 type: string
    *                 enum: [ACTIVE, UNACTIVE]
    *                 example: "UNACTIVE"
    *     responses:
    *       200:
    *         description: User creation result
    *         content:
    *           application/json:
    *             examples:
    *               success:
    *                 summary: User created successfully
    *                 value:
    *                   EC: 0
    *                   EM: "A new user has created successfuly"
    *                   DT: ""
    *               duplicateEmail:
    *                 summary: Email already exists
    *                 value:
    *                   EC: 1
    *                   EM: "The email was already exist"
    *                   DT: ""
    *               missingParam:
    *                 summary: Missing required parameters
    *                 value:
    *                   EC: 1
    *                   EM: "Missing required parameter"
    *                   DT: ""
    *               shortPassword:
    *                 summary: Password too short
    *                 value:
    *                   EC: 1
    *                   EM: "Your password must have more than 6 letters"
    *                   DT: ""
    *       500:
    *         description: Internal server error
    *         content:
    *           application/json:
    *             example:
    *               EC: -1
    *               EM: "Error from server"
    *               DT: ""
    */

   router.post('/admin/createNewUser', JWTAction.checkPermission(['admin']), userController.createNewUser)

   // Chỉnh sửa thông tin user
   /**
* @swagger
* /api/v1/user/admin/editUserInfor:
*   put:
*     summary: Edit user information (admin only)
*     description: Update existing user details by email. Admins can modify username, role, and status.
*     tags: [User]
*     security:
*       - BearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - email
*             properties:
*               email:
*                 type: string
*                 format: email
*                 example: "user1@example.com"
*               username:
*                 type: string
*                 description: Updated username
*                 example: "Updated User"
*               role:
*                 type: string
*                 enum: [user, admin]
*                 description: Updated role
*                 example: "admin"
*               status:
*                 type: string
*                 enum: [ACTIVE, UNACTIVE]
*                 description: Account activation status
*                 example: "ACTIVE"
*     responses:
*       200:
*         description: User update result
*         content:
*           application/json:
*             examples:
*               success:
*                 summary: Update successful
*                 value:
*                   EC: 0
*                   EM: "Update success"
*                   DT: ""
*               notFound:
*                 summary: User not found
*                 value:
*                   EC: 2
*                   EM: "Update user error. Not found user"
*                   DT: ""
*               missingParam:
*                 summary: Missing required parameter
*                 value:
*                   EC: 1
*                   EM: "Missing required parameter"
*                   DT: ""
*       500:
*         description: Internal server error
*         content:
*           application/json:
*             example:
*               EC: -1
*               EM: "Error updateUserInforService"
*               DT: ""
*/

   router.put('/admin/editUserInfor', JWTAction.checkPermission(['admin']), userController.editUserInfor)


   // Xóa thông tin người dùng
   /**
* @swagger
* /api/v1/user/deleteUser:
*   delete:
*     summary: Delete a user (admin only)
*     description: Permanently remove a user from the database using their email. Only users with the "admin" role can perform this action.
*     tags: [User]
*     security:
*       - BearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - email
*             properties:
*               email:
*                 type: string
*                 format: email
*                 example: "user1@example.com"
*     responses:
*       200:
*         description: Deletion result
*         content:
*           application/json:
*             examples:
*               success:
*                 summary: User deleted successfully
*                 value:
*                   EC: 0
*                   EM: "Delete user success"
*                   DT: ""
*               notFound:
*                 summary: User not found
*                 value:
*                   EC: 2
*                   EM: "User is not exist"
*                   DT: ""
*               missingParam:
*                 summary: Missing required parameter
*                 value:
*                   EC: 1
*                   EM: "Missing required parameter"
*                   DT: ""
*       403:
*         description: Forbidden — user does not have admin privileges
*         content:
*           application/json:
*             example:
*               EC: 3
*               EM: "Permission denied"
*               DT: ""
*       500:
*         description: Internal server error
*         content:
*           application/json:
*             example:
*               EC: -1
*               EM: "Error from server"
*               DT: ""
*/
   router.delete('/deleteUser', JWTAction.checkPermission(['admin']), userController.deleteUser);
   return app.use('/api/v1', router)
}
