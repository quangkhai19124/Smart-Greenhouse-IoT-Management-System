import userService from '../service/userService.js';

const handleRegister = async (req, res) => {
  try {
    if (!req.body || !req.body.email || !req.body.password) {
      return res.status(200).json({
        EM: 'Missing required parameter',
        EC: '1',
        DT: '',
      });
    }
    if (req.body && req.body.password.length < 6) {
      return res.status(200).json({
        EM: 'Your password must have more than 6 letters',
        EC: '1',
        DT: '',
      });
    }
    let data = await userService.handleRegisterService(req.body);
    console.log('Error in handleRegister3: ');
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (e) {
    console.log('Error in handleRegister1: ', e);
    return res.status(500).json({
      EM: 'Error from server',
      EC: '-1',
      DT: '',
    });
  }
};
const handleLogin = async (req, res) => {
  try {
    if (!req.body || !req.body.email || !req.body.password) {
      return res.status(200).json({
        EM: 'Missing required parameter',
        EC: 1,
        DT: '',
      });
    }
    let data = await userService.handleUserLoginService(req.body);

    if (data.EC === 0) {
      // Gửi token qua cookie 
      res.cookie('jwt', data.DT.access_token, {
        httpOnly: true, // bảo vệ khỏi JS
        maxAge: 60 * 60 * 1000, // 1h
      });
    }

    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (e) {
    console.log('Error in handleLogin: ', e);
    return res.status(500).json({
      EM: 'Error from server',
      EC: '-1',
      DT: '',
    });
  }
};

const handleAllUser = async (req, res) => {
  try {
    let data = await userService.getAllUser();
    return res.status(200).json({
      EC: data.EC,
      EM: data.EM,
      DT: data.DT,
    });
  } catch (e) {
    console.log('Error in handleAllUser: ', e);
    return res.status(500).json({
      EM: 'Error from server',
      EC: '-1',
      DT: '',
    });
  }
};
const handleGetUserInfor = async (req, res) => {
  try {
    if (!req.query || !req.query.id) {
      return res.status(500).json({
        EM: 'Missing required parameter',
        EC: '1',
        DT: '',
      });
    }
    let data = await userService.getUserInforService(req.query.id);
    return res.status(200).json({
      EC: data.EC,
      EM: data.EM,
      DT: data.DT,
    });
  } catch (e) {
    console.log('Error in handleGetUserInfor: ', e);
    return res.status(500).json({
      EM: 'Error from server',
      EC: '-1',
      DT: '',
    });
  }
};
const handleLogout = async (req, res) => {
  try {
    let logoutService = await userService.logoutService(req.user.email);
    res.clearCookie('jwt')
    return res.status(200).json(logoutService);
  } catch (e) {
    console.log('Error in handleLogout:', e);
    return res.status(500).json({
      EM: 'Error from server',
      EC: -1,
      DT: '',
    });
  }
};

const createNewUser = async (req, res) => {
  try {
    if (!req.body || !req.body.email || !req.body.password || !req.body.username || !req.body.role) {
      return res.status(200).json({
        EM: 'Missing required parameter',
        EC: '1',
        DT: '',
      });
    }
    if (req.body && req.body.password.length < 6) {
      return res.status(200).json({
        EM: 'Your password must have more than 6 letters',
        EC: '1',
        DT: '',
      });
    }
    let data = await userService.handleRegisterService(req.body);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (e) {
    console.log('Error in createNewUser: ', e);
    return res.status(500).json({
      EM: 'Error from server',
      EC: '-1',
      DT: '',
    });
  }
}

const editUserInfor = async (req, res) => {
  try {
    if (!req.body || !req.body.email) {
      return res.status(200).json({
        EM: 'Missing required parameter',
        EC: 1,
        DT: '',
      });
    }
    
    // Kiểm tra nếu user tự ban chính mình
    const currentUserEmail = req.user?.email;
    const targetUserEmail = req.body.email;
    const newStatus = req.body.status;
    
    if (currentUserEmail && currentUserEmail === targetUserEmail && 
        (newStatus === 'BANNED' || newStatus === 'UNACTIVE')) {
      return res.status(200).json({
        EM: 'Error',
        EC: 1,
        DT: '',
      });
    }
    const result = await userService.updateUserInforService(req.body);
    return res.status(200).json({
      EM: result.EM,
      EC: result.EC,
      DT: result.DT,
    });
  } catch (err) {
    console.log('Error in editUserInfor: ', err);
    return res.status(500).json({
      EM: 'Error from server',
      EC: '-1',
      DT: '',
    });
  }
}
const deleteUser = async (req, res) => {
  try {
    if (!req.body || !req.body.email) {
      return res.status(200).json({
        EM: "Missing required parameter",
        EC: 1,
        DT: '',
      });
    }
    const result = await userService.deleteUserService(req.body.email);
    return res.status(200).json({
      EM: result.EM,
      EC: result.EC,
      DT: result.DT,
    });
  } catch (err) {
    console.log('Error in deleteUser: ', err);
    return res.status(500).json({
      EM: 'Error from server',
      EC: '-1',
      DT: '',
    });
  }
}
const handleGetCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    const email = user.email;
    const userInfor = await userService.getCurrentUserService(email);
    return res.status(200).json(userInfor);
  } catch (err) {
    console.log('Error in handleGetCurrentUser: ', err);
    return res.status(500).json({
      EM: 'Error from server',
      EC: '-1',
      DT: '',
    });
  }
}

const handleUpdateCurrentUserProfile = async (req, res) => {
  try {
    const email = req.user?.email;
    const { username, teleChatID } = req.body || {};

    const result = await userService.updateCurrentUserProfileService(email, { username, teleChatID });
    return res.status(200).json(result);
  } catch (err) {
    console.log('Error in handleUpdateCurrentUserProfile: ', err);
    return res.status(500).json({
      EM: 'Error from server',
      EC: '-1',
      DT: '',
    });
  }
}
export default {
  handleRegister,
  handleLogin,
  handleAllUser,
  handleGetUserInfor,
  handleLogout, createNewUser, editUserInfor, deleteUser, handleGetCurrentUser,
  handleUpdateCurrentUserProfile,
};
