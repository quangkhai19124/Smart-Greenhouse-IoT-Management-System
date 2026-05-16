import bcrypt from 'bcrypt';
import JWTAction from '../middleware/JWTAction'
import { Op } from 'sequelize';

import db from '../models/index';
require('dotenv').config();
const saltRounds = 10;

const hashPassword = (password) => {
  let salt = bcrypt.genSaltSync(saltRounds);
  let hashPass = bcrypt.hashSync(password, salt);
  return hashPass;
};
const checkEmailExist = async (email) => {
  console.log('Check check email1:', email);
  let checkEmail = await db.Users.findOne({
    where: { email: email },
  });
  // let checkEmail = await db.Sensor.findAll({
  //     // where: { email: email }
  //     raw: true
  // })
  console.log('Check check email: ', checkEmail);
  if (checkEmail) {
    return true;
  } else {
    return false;
  }
};
const handleRegisterService = async (inputData) => {
  console.log('Check check inputData: ', inputData);
  let checkEmail = await checkEmailExist(inputData.email);
  console.log('Check check inputData: ', inputData);
  let role = inputData.role ? inputData.role : 'User';
  if (checkEmail) {
    return {
      EM: 'The email was already exist',
      EC: 1,
      DT: '',
    };
  }
  let hashPass = hashPassword(inputData.password);
  try {
    await db.Users.create({
      email: inputData.email,
      password: hashPass,
      username: inputData.username || inputData.email,
      role: role || 'user',
      status: inputData.status || 'UNACTIVE',
    });
    return {
      EM: 'A new user has created successfuly',
      EC: 0,
      DT: '',
    };
  } catch (e) {
    console.log('Check error in createNewUserService: ', e);
    return {
      EM: 'Something wrongs in service',
      EC: 2,
      DT: '',
    };
  }
};
const checkPassword = (inputPassword, hassPassword) => {
  return bcrypt.compareSync(inputPassword, hassPassword);
};
const handleUserLoginService = async (userData) => {
  try {
    let valueLogin = userData.email;
    let user = await db.Users.findOne({
      where: {
        [Op.or]: [{ email: valueLogin }],
      },
    });
    if (user) {
      if (user.status === 'BANNED') {
        return {
          EM: 'You have been banned',
          EC: 2,
          DT: '',
        };
      }
      let checkPasswordCorrect = await checkPassword(userData.password, user.password);
      if (checkPasswordCorrect === true) {
        await db.Users.update(
          { status: 'ACTIVE' },
          { where: { email: user.email } }
        );
        let tokenPayload = {
          role: user.role,
          email: user.email,
          username: user.username,
        }
        let token = JWTAction.createJWT(tokenPayload);
        return {
          EM: 'Login success ',
          EC: 0,
          DT: {
            access_token: token,
            role: user.role,
            email: user.email,
            username: user.username,
          },
        };
      }
    }
    else {
      await db.Users.update(
        { status: 'UNACTIVE' },
        { where: { email: user.email } }
      );
      console.log('Not found user email: ', userData.valueLogin, ' Password: ', userData.password);
      return {
        EM: 'Your email or password is incorrect!',
        EC: 1,
        DT: '',
      };
    }
  } catch (e) {
    console.log('Error in handleUserLoginService: ', e);
    return {
      EM: 'Error from server...',
      EC: -1,
      DT: '',
    };
  }
};
const logoutService = async (email) => {
  try {
    let logout = await db.Users.update(
      { status: 'UNACTIVE' },
      { where: { email: email } }
    );
    return {
      EM: 'Logout successful',
      EC: 0,
      DT: '',
    }
  }
  catch (e) {
    console.log("Error in logoutService: ", e)
    return {
      EM: 'Error in logoutService',
      EC: 0,
      DT: '',
    }
  }
}
const getAllUser = async () => {
  try {
    let users = await db.Users.findAll({
      attributes: ['id', 'username', 'email', 'role', 'status'],
    });
    if (users) {
      return {
        EM: 'Get data success',
        EC: 0,
        DT: users,
      };
    } else {
      return {
        EM: 'Get data success',
        EC: 0,
        DT: [],
      };
    }
  } catch (e) {
    console.log('Error in getAllUser: ', e);
    return {
      EM: 'Something wrong from with services',
      EC: 1,
      DT: '',
    };
  }
};
const getUserInforService = async (userId) => {
  try {
    let users = await db.Users.findOne({
      where: { id: userId },
      attributes: ['id', 'username', 'email', 'role', 'status'],
    });
    if (users) {
      return {
        EM: 'Get data success',
        EC: 0,
        DT: users,
      };
    } else {
      return {
        EM: 'Get data success',
        EC: 0,
        DT: [],
      };
    }
  } catch (e) {
    console.log('Error in getAllUser: ', e);
    return {
      EM: 'Something wrong from with services',
      EC: 1,
      DT: '',
    };
  }
};

const getCurrentUserService = async (email) => {
  try {
    let user = await db.Users.findOne({
      where: { email: email },
      attributes: ['id', 'username', 'email', 'role', 'teleChatID', 'status'],
    });
    if (user) {
      return {
        EM: 'Get data success',
        EC: 0,
        DT: user,
      };
    }
    return user;
  }
  catch (e) {
    console.log('Error in getCurrentUserService: ', e);
    return {
      EM: 'Error from server',
      EC: -1,
      DT: '',
    };
  }
};

const updateCurrentUserProfileService = async (email, updates) => {
  try {
    if (!email) {
      return {
        EM: 'Unauthorized',
        EC: -1,
        DT: '',
      };
    }

    const { username, teleChatID } = updates || {};
    if (username === undefined && teleChatID === undefined) {
      return {
        EM: 'No fields to update',
        EC: 1,
        DT: '',
      };
    }

    let user = await db.Users.findOne({ where: { email } });
    if (!user) {
      return {
        EM: 'User not found',
        EC: 2,
        DT: '',
      };
    }

    const payloadToUpdate = {};
    if (username !== undefined) payloadToUpdate.username = username;
    if (teleChatID !== undefined) payloadToUpdate.teleChatID = teleChatID;

    await user.update(payloadToUpdate);

    return {
      EM: 'Update success',
      EC: 0,
      DT: {
        id: user.id,
        email: user.email,
        username: user.username,
        teleChatID: user.teleChatID,
        role: user.role,
      },
    };
  } catch (e) {
    console.error('❌ Error updateCurrentUserProfileService:', e);
    return {
      EM: 'Error updateCurrentUserProfileService',
      EC: -1,
      DT: '',
    };
  }
};

const updateUserInforService = async (inputData) => {
  try {
    if (!inputData.email) {
      return {
        EM: 'Update error. User input not found',
        EC: 1,
        DT: '',
      };
    }
    let user = await db.Users.findOne({
      where: { email: inputData.email },
    });
    console.log("Check check user: ", user)
    if (user) {
      await user.update({
        email: user.email,
        username: inputData.username,
        role: inputData.role,
        password: user.password,
        status: inputData.status,
      });
      return {
        EM: 'Update success',
        EC: 0,
        DT: '',
      };
    } else {
      //Not found
      return {
        EM: 'Update user error. Not found user',
        EC: 2,
        DT: '',
      };
    }
  } catch (e) {
    console.error('❌ Error updateUserInforService:', e);
    return {
      EM: 'Error updateUserInforService',
      EC: -1,
      DT: '',
    };
  }
}
const deleteUserService = async (email) => {
  try {
    let user = await db.Users.findOne({
      where: { email: email },
    });
    if (user) {
      await user.destroy();
      return {
        EM: 'Delete user success',
        EC: 0,
        DT: '',
      };
    } else {
      return {
        EM: 'User is not exist',
        EC: 2,
        DT: '',
      };
    }
  } catch (e) {
    console.error('❌ Error deleteUserService:', e);
    return {
      EM: 'Error deleteUserService',
      EC: 2,
      DT: '',
    };
  }
}
export default {
  handleRegisterService,
  handleUserLoginService,
  getAllUser,
  getUserInforService, getCurrentUserService, logoutService, updateUserInforService,
  deleteUserService,
  updateCurrentUserProfileService,
};
