const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (filename) => path.join(DATA_DIR, filename);

const readJsonFile = (filename, defaultData = []) => {
  const filePath = getFilePath(filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return defaultData;
  }
};

const writeJsonFile = (filename, data) => {
  const filePath = getFilePath(filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  SUPERVISOR: 'supervisor',
  DORM_ADMIN: 'dorm_admin',
  MEMBER: 'member'
};

const ROLE_LEVELS = {
  system_admin: 4,
  supervisor: 3,
  dorm_admin: 2,
  member: 1
};

const requireRole = (roles) => {
  return (req, res, next) => {
    const role = req.headers['x-role'] || 'member';
    if (roles.includes(role)) {
      next();
    } else {
      res.status(403).json({ error: '权限不足' });
    }
  };
};

const requireMinRole = (minRole) => {
  return (req, res, next) => {
    const role = req.headers['x-role'] || 'member';
    if (ROLE_LEVELS[role] >= ROLE_LEVELS[minRole]) {
      next();
    } else {
      res.status(403).json({ error: '权限不足' });
    }
  };
};

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const usersData = readJsonFile('users.json', {});
  
  const user = Object.values(usersData).find(u => u.username === username && u.password === password);
  
  if (user) {
    res.json({ 
      success: true, 
      role: user.role, 
      username: user.username,
      name: user.name,
      floorId: user.floorId,
      dormId: user.dormId,
      floorName: user.floorName,
      dormName: user.dormName,
      className: user.className,
      buildingName: user.buildingName
    });
  } else {
    res.status(401).json({ success: false, message: '用户名或密码错误' });
  }
});

app.get('/api/validate', (req, res) => {
  res.json({ success: true });
});

app.post('/api/validate-invite', (req, res) => {
  const { code } = req.body;
  const buildingsData = readJsonFile('buildings.json', { floors: [], dormitories: [], invites: [] });
  
  const invite = buildingsData.invites.find(i => i.code === code);
  
  if (!invite) {
    return res.status(404).json({ success: false, message: '邀请码不存在' });
  }
  
  const now = Date.now();
  
  if (invite.used) {
    return res.status(400).json({ success: false, message: '邀请码已被使用' });
  }
  
  if (now > invite.expireTime) {
    return res.status(400).json({ success: false, message: '邀请码已过期' });
  }
  
  if (invite.type === 'floor') {
    const floor = buildingsData.floors.find(f => f.id === invite.floorId);
    res.json({ 
      success: true, 
      type: 'floor',
      floorId: invite.floorId,
      floorName: floor ? floor.name : '',
      buildingName: floor ? floor.buildingName : ''
    });
  } else {
    const dorm = buildingsData.dormitories.find(d => d.id === invite.dormId);
    const floor = buildingsData.floors.find(f => f.id === dorm?.floorId);
    res.json({ 
      success: true, 
      type: 'dorm',
      dormId: invite.dormId,
      dormName: dorm ? dorm.name : '',
      className: dorm ? dorm.className : '',
      floorId: dorm?.floorId,
      floorName: floor ? floor.name : ''
    });
  }
});

app.post('/api/bind-role', (req, res) => {
  const { code, username, password, name, role } = req.body;
  const buildingsData = readJsonFile('buildings.json', { floors: [], dormitories: [], invites: [] });
  const usersData = readJsonFile('users.json', {});
  
  const invite = buildingsData.invites.find(i => i.code === code);
  
  if (!invite) {
    return res.status(404).json({ success: false, message: '邀请码不存在' });
  }
  
  const now = Date.now();
  
  if (invite.used) {
    return res.status(400).json({ success: false, message: '邀请码已被使用' });
  }
  
  if (now > invite.expireTime) {
    return res.status(400).json({ success: false, message: '邀请码已过期' });
  }
  
  if (Object.values(usersData).some(u => u.username === username)) {
    return res.status(400).json({ success: false, message: '用户名已存在' });
  }
  
  let userId = generateId();
  let userRole = role;
  let floorId = null;
  let dormId = null;
  let floorName = '';
  let dormName = '';
  let className = '';
  
  let buildingName = '';
  
  if (invite.type === 'floor') {
    if (role !== 'supervisor') {
      return res.status(403).json({ success: false, message: '楼层邀请码只能用于宿管绑定' });
    }
    floorId = invite.floorId;
    const floor = buildingsData.floors.find(f => f.id === invite.floorId);
    floorName = floor?.name || '';
    buildingName = floor?.buildingName || '';
    invite.used = true;
    invite.usedBy = userId;
    invite.usedAt = new Date().toISOString();
  } else {
    if (role !== 'dorm_admin') {
      return res.status(403).json({ success: false, message: '宿舍邀请码只能用于舍长绑定' });
    }
    dormId = invite.dormId;
    const dorm = buildingsData.dormitories.find(d => d.id === invite.dormId);
    floorId = dorm?.floorId;
    const floor = buildingsData.floors.find(f => f.id === dorm?.floorId);
    floorName = floor?.name || '';
    buildingName = floor?.buildingName || '';
    dormName = dorm?.name || '';
    className = dorm?.className || '';
    invite.used = true;
    invite.usedBy = userId;
    invite.usedAt = new Date().toISOString();
  }
  
  usersData[userId] = {
    id: userId,
    username,
    password,
    role: userRole,
    name,
    floorId,
    dormId,
    floorName,
    dormName,
    className,
    buildingName,
    createdAt: new Date().toISOString()
  };
  
  writeJsonFile('users.json', usersData);
  writeJsonFile('buildings.json', buildingsData);
  
  res.json({ 
    success: true, 
    role: userRole, 
    username,
    name,
    floorId,
    dormId,
    floorName,
    dormName,
    className
  });
});

app.get('/api/invites', requireRole(['system_admin']), (req, res) => {
  const buildingsData = readJsonFile('buildings.json', { floors: [], dormitories: [], invites: [] });
  res.json(buildingsData.invites);
});

app.post('/api/floors', requireRole(['system_admin']), (req, res) => {
  const buildingsData = readJsonFile('buildings.json', { floors: [], dormitories: [], invites: [] });
  
  const newFloor = {
    id: generateId(),
    name: req.body.name,
    buildingName: req.body.buildingName || '宿舍楼',
    createdAt: new Date().toISOString(),
    createdBy: req.headers['x-username'] || 'system'
  };
  
  buildingsData.floors.push(newFloor);
  
  const inviteCode = generateInviteCode();
  buildingsData.invites.push({
    id: generateId(),
    code: inviteCode,
    type: 'floor',
    floorId: newFloor.id,
    expireTime: Date.now() + 24 * 60 * 60 * 1000,
    used: false,
    createdAt: new Date().toISOString()
  });
  
  writeJsonFile('buildings.json', buildingsData);
  
  res.json({ 
    success: true, 
    floor: newFloor,
    inviteCode 
  });
});

app.get('/api/floors', requireRole(['system_admin']), (req, res) => {
  const buildingsData = readJsonFile('buildings.json', { floors: [], dormitories: [], invites: [] });
  res.json(buildingsData.floors);
});

app.get('/api/floors/:id', requireMinRole('supervisor'), (req, res) => {
  const buildingsData = readJsonFile('buildings.json', { floors: [], dormitories: [], invites: [] });
  const role = req.headers['x-role'];
  const userFloorId = req.headers['x-floor-id'];
  
  const floor = buildingsData.floors.find(f => f.id === req.params.id);
  
  if (!floor) {
    return res.status(404).json({ error: '楼层不存在' });
  }
  
  if (role === 'supervisor' && userFloorId !== req.params.id) {
    return res.status(403).json({ error: '只能查看自己绑定的楼层' });
  }
  
  const floorDorms = buildingsData.dormitories.filter(d => d.floorId === req.params.id);
  
  res.json({ 
    floor, 
    dormitories: floorDorms 
  });
});

app.put('/api/floors/:id', requireRole(['system_admin']), (req, res) => {
  const buildingsData = readJsonFile('buildings.json', { floors: [], dormitories: [], invites: [] });
  const index = buildingsData.floors.findIndex(f => f.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: '楼层不存在' });
  }
  
  buildingsData.floors[index] = { 
    ...buildingsData.floors[index], 
    ...req.body, 
    updatedAt: new Date().toISOString() 
  };
  
  writeJsonFile('buildings.json', buildingsData);
  res.json(buildingsData.floors[index]);
});

app.delete('/api/floors/:id', requireRole(['system_admin']), (req, res) => {
  const buildingsData = readJsonFile('buildings.json', { floors: [], dormitories: [], invites: [] });
  const beforeLength = buildingsData.floors.length;
  
  buildingsData.floors = buildingsData.floors.filter(f => f.id !== req.params.id);
  buildingsData.dormitories = buildingsData.dormitories.filter(d => d.floorId !== req.params.id);
  buildingsData.invites = buildingsData.invites.filter(i => i.floorId !== req.params.id);
  
  const usersData = readJsonFile('users.json', {});
  Object.keys(usersData).forEach(key => {
    if (usersData[key].floorId === req.params.id) {
      delete usersData[key];
    }
  });
  writeJsonFile('users.json', usersData);
  
  if (buildingsData.floors.length === beforeLength) {
    return res.status(404).json({ error: '楼层不存在' });
  }
  
  writeJsonFile('buildings.json', buildingsData);
  res.json({ success: true });
});

app.post('/api/floors/:id/regenerate-invite', requireRole(['system_admin']), (req, res) => {
  const buildingsData = readJsonFile('buildings.json', { floors: [], dormitories: [], invites: [] });
  
  buildingsData.invites = buildingsData.invites.filter(i => !(i.floorId === req.params.id && i.type === 'floor'));
  
  const inviteCode = generateInviteCode();
  buildingsData.invites.push({
    id: generateId(),
    code: inviteCode,
    type: 'floor',
    floorId: req.params.id,
    expireTime: Date.now() + 24 * 60 * 60 * 1000,
    used: false,
    createdAt: new Date().toISOString()
  });
  
  writeJsonFile('buildings.json', buildingsData);
  res.json({ success: true, inviteCode });
});

app.post('/api/dormitories', requireRole(['system_admin']), (req, res) => {
  const { floorId, name, className } = req.body;
  const buildingsData = readJsonFile('buildings.json', { floors: [], dormitories: [], invites: [] });
  
  const floor = buildingsData.floors.find(f => f.id === floorId);
  if (!floor) {
    return res.status(404).json({ error: '楼层不存在' });
  }
  
  const newDorm = {
    id: generateId(),
    floorId,
    name,
    className,
    createdAt: new Date().toISOString(),
    createdBy: req.headers['x-username'] || 'system'
  };
  
  buildingsData.dormitories.push(newDorm);
  
  const inviteCode = generateInviteCode();
  buildingsData.invites.push({
    id: generateId(),
    code: inviteCode,
    type: 'dorm',
    dormId: newDorm.id,
    expireTime: Date.now() + 24 * 60 * 60 * 1000,
    used: false,
    createdAt: new Date().toISOString()
  });
  
  writeJsonFile('buildings.json', buildingsData);
  
  res.json({ 
    success: true, 
    dormitory: newDorm,
    inviteCode 
  });
});

app.get('/api/dormitories', requireMinRole('supervisor'), (req, res) => {
  const buildingsData = readJsonFile('buildings.json', { floors: [], dormitories: [], invites: [] });
  const role = req.headers['x-role'];
  const floorId = req.headers['x-floor-id'];
  
  let dorms = buildingsData.dormitories;
  
  if (role === 'supervisor' && floorId) {
    dorms = dorms.filter(d => d.floorId === floorId);
  } else if (role === 'dorm_admin') {
    const dormId = req.headers['x-dorm-id'];
    dorms = dorms.filter(d => d.id === dormId);
  }
  
  res.json(dorms);
});

app.get('/api/dormitories/:id', requireMinRole('dorm_admin'), (req, res) => {
  const buildingsData = readJsonFile('buildings.json', { floors: [], dormitories: [], invites: [] });
  const role = req.headers['x-role'];
  const floorId = req.headers['x-floor-id'];
  const dormId = req.headers['x-dorm-id'];
  
  const dorm = buildingsData.dormitories.find(d => d.id === req.params.id);
  
  if (!dorm) {
    return res.status(404).json({ error: '宿舍不存在' });
  }
  
  if (role === 'supervisor' && dorm.floorId !== floorId) {
    return res.status(403).json({ error: '只能查看自己楼层的宿舍' });
  }
  
  if (role === 'dorm_admin' && dorm.id !== dormId) {
    return res.status(403).json({ error: '只能查看自己宿舍' });
  }
  
  res.json(dorm);
});

app.put('/api/dormitories/:id', requireRole(['system_admin']), (req, res) => {
  const buildingsData = readJsonFile('buildings.json', { floors: [], dormitories: [], invites: [] });
  const index = buildingsData.dormitories.findIndex(d => d.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: '宿舍不存在' });
  }
  
  buildingsData.dormitories[index] = { 
    ...buildingsData.dormitories[index], 
    ...req.body, 
    updatedAt: new Date().toISOString() 
  };
  
  writeJsonFile('buildings.json', buildingsData);
  res.json(buildingsData.dormitories[index]);
});

app.delete('/api/dormitories/:id', requireRole(['system_admin']), (req, res) => {
  const buildingsData = readJsonFile('buildings.json', { floors: [], dormitories: [], invites: [] });
  const beforeLength = buildingsData.dormitories.length;
  
  buildingsData.dormitories = buildingsData.dormitories.filter(d => d.id !== req.params.id);
  buildingsData.invites = buildingsData.invites.filter(i => i.dormId === req.params.id);
  
  const usersData = readJsonFile('users.json', {});
  Object.keys(usersData).forEach(key => {
    if (usersData[key].dormId === req.params.id) {
      delete usersData[key];
    }
  });
  writeJsonFile('users.json', usersData);
  
  if (buildingsData.dormitories.length === beforeLength) {
    return res.status(404).json({ error: '宿舍不存在' });
  }
  
  writeJsonFile('buildings.json', buildingsData);
  res.json({ success: true });
});

app.post('/api/dormitories/:id/regenerate-invite', requireRole(['system_admin']), (req, res) => {
  const buildingsData = readJsonFile('buildings.json', { floors: [], dormitories: [], invites: [] });
  
  buildingsData.invites = buildingsData.invites.filter(i => !(i.dormId === req.params.id && i.type === 'dorm'));
  
  const inviteCode = generateInviteCode();
  buildingsData.invites.push({
    id: generateId(),
    code: inviteCode,
    type: 'dorm',
    dormId: req.params.id,
    expireTime: Date.now() + 24 * 60 * 60 * 1000,
    used: false,
    createdAt: new Date().toISOString()
  });
  
  writeJsonFile('buildings.json', buildingsData);
  res.json({ success: true, inviteCode });
});

app.post('/api/users', requireRole(['dorm_admin']), (req, res) => {
  const { username, password, name } = req.body;
  const dormId = req.headers['x-dorm-id'];
  const usersData = readJsonFile('users.json', {});
  
  if (!dormId) {
    return res.status(400).json({ error: '未绑定宿舍' });
  }
  
  if (Object.values(usersData).some(u => u.username === username)) {
    return res.status(400).json({ error: '用户名已存在' });
  }
  
  const buildingsData = readJsonFile('buildings.json', { floors: [], dormitories: [], invites: [] });
  const dorm = buildingsData.dormitories.find(d => d.id === dormId);
  const floor = buildingsData.floors.find(f => f.id === dorm?.floorId);
  
  const userId = generateId();
  usersData[userId] = {
    id: userId,
    username,
    password,
    role: 'member',
    name,
    floorId: dorm?.floorId,
    dormId,
    floorName: floor?.name || '',
    dormName: dorm?.name || '',
    className: dorm?.className || '',
    buildingName: floor?.buildingName || '',
    createdAt: new Date().toISOString(),
    createdBy: req.headers['x-username'] || 'system'
  };
  
  writeJsonFile('users.json', usersData);
  res.json({ success: true, user: usersData[userId] });
});

app.get('/api/users', requireMinRole('supervisor'), (req, res) => {
  const usersData = readJsonFile('users.json', {});
  const role = req.headers['x-role'];
  const floorId = req.headers['x-floor-id'];
  const dormId = req.headers['x-dorm-id'];
  
  let users = Object.values(usersData);
  
  if (role === 'system_admin') {
    users = users.filter(u => u.role !== 'system_admin');
  } else if (role === 'supervisor' && floorId) {
    users = users.filter(u => u.floorId === floorId && u.role !== 'supervisor');
  } else if (role === 'dorm_admin' && dormId) {
    users = users.filter(u => u.dormId === dormId && u.role === 'member');
  }
  
  res.json(users);
});

app.get('/api/users/:id', requireMinRole('dorm_admin'), (req, res) => {
  const usersData = readJsonFile('users.json', {});
  const user = usersData[req.params.id];
  
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const role = req.headers['x-role'];
  const floorId = req.headers['x-floor-id'];
  const dormId = req.headers['x-dorm-id'];
  
  if (role === 'supervisor' && user.floorId !== floorId) {
    return res.status(403).json({ error: '只能查看本楼层用户' });
  }
  
  if (role === 'dorm_admin' && user.dormId !== dormId) {
    return res.status(403).json({ error: '只能查看本宿舍用户' });
  }
  
  res.json(user);
});

app.put('/api/users/:id', requireMinRole('dorm_admin'), (req, res) => {
  const usersData = readJsonFile('users.json', {});
  const user = usersData[req.params.id];
  
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const role = req.headers['x-role'];
  const dormId = req.headers['x-dorm-id'];
  
  if (role === 'dorm_admin') {
    if (user.dormId !== dormId) {
      return res.status(403).json({ error: '只能修改本宿舍用户' });
    }
    if (req.body.role && req.body.role !== 'member') {
      return res.status(403).json({ error: '只能设置成员角色' });
    }
  }
  
  usersData[req.params.id] = { 
    ...user, 
    ...req.body, 
    updatedAt: new Date().toISOString() 
  };
  
  writeJsonFile('users.json', usersData);
  res.json(usersData[req.params.id]);
});

app.delete('/api/users/:id', requireMinRole('dorm_admin'), (req, res) => {
  const usersData = readJsonFile('users.json', {});
  const user = usersData[req.params.id];
  
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const role = req.headers['x-role'];
  const floorId = req.headers['x-floor-id'];
  const dormId = req.headers['x-dorm-id'];
  
  if (role === 'supervisor' && user.floorId !== floorId) {
    return res.status(403).json({ error: '只能删除本楼层用户' });
  }
  
  if (role === 'dorm_admin' && user.dormId !== dormId) {
    return res.status(403).json({ error: '只能删除本宿舍用户' });
  }
  
  delete usersData[req.params.id];
  writeJsonFile('users.json', usersData);
  res.json({ success: true });
});

app.get('/api/user-info', (req, res) => {
  const role = req.headers['x-role'];
  const username = req.headers['x-username'];
  
  if (role === 'system_admin') {
    res.json({ 
      role: 'system_admin', 
      name: '系统管理员',
      hasFullAccess: true
    });
    return;
  }
  
  const usersData = readJsonFile('users.json', {});
  const user = Object.values(usersData).find(u => u.username === username);
  
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  res.json({
    role: user.role,
    name: user.name,
    username: user.username,
    floorId: user.floorId,
    floorName: user.floorName,
    dormId: user.dormId,
    dormName: user.dormName,
    className: user.className,
    buildingName: user.buildingName
  });
});

app.delete('/api/all-data', requireRole(['system_admin']), (req, res) => {
  const files = ['users.json', 'buildings.json', 'roommates.json', 'schedule.json', 'bills.json', 'electricity.json', 'items.json', 'beds.json', 'repairs.json', 'clean.json'];
  
  files.forEach(file => {
    const filePath = getFilePath(file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
  
  res.json({ success: true, message: '所有数据已删除' });
});

app.get('/api/roommates', requireMinRole('member'), (req, res) => {
  const role = req.headers['x-role'];
  const floorId = req.headers['x-floor-id'];
  const dormId = req.headers['x-dorm-id'];
  
  let data = readJsonFile('roommates.json', []);
  
  if (role !== 'system_admin') {
    data = data.filter(r => {
      if (role === 'supervisor' && floorId) {
        return r.floorId === floorId;
      }
      if ((role === 'dorm_admin' || role === 'member') && dormId) {
        return r.dormId === dormId;
      }
      return false;
    });
  }
  
  res.json(data);
});

app.post('/api/roommates', requireRole(['supervisor', 'system_admin']), (req, res) => {
  const role = req.headers['x-role'];
  const floorId = req.headers['x-floor-id'];
  const dormId = req.body.dormId;
  
  if (role === 'supervisor') {
    const buildingsData = readJsonFile('buildings.json', { floors: [], dormitories: [], invites: [] });
    const dorm = buildingsData.dormitories.find(d => d.id === dormId);
    if (!dorm || dorm.floorId !== floorId) {
      return res.status(403).json({ error: '只能添加自己楼层的成员' });
    }
  }
  
  const data = readJsonFile('roommates.json', []);
  const newRoommate = {
    id: generateId(),
    name: req.body.name,
    username: req.body.username || '',
    phone: req.body.phone || '',
    role: req.body.role || 'member',
    dormId: dormId,
    floorId: req.body.floorId,
    bedId: req.body.bedId || '',
    bedNumber: req.body.bedNumber || '',
    createdAt: new Date().toISOString(),
    createdBy: req.headers['x-username'] || 'system'
  };
  data.push(newRoommate);
  writeJsonFile('roommates.json', data);
  res.json(newRoommate);
});

app.put('/api/roommates/:id', requireRole(['supervisor', 'system_admin']), (req, res) => {
  const role = req.headers['x-role'];
  const floorId = req.headers['x-floor-id'];
  
  const data = readJsonFile('roommates.json', []);
  const index = data.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '室友不存在' });
  }
  
  if (role === 'supervisor' && data[index].floorId !== floorId) {
    return res.status(403).json({ error: '只能修改自己楼层的成员' });
  }
  
  data[index] = { ...data[index], ...req.body, updatedAt: new Date().toISOString() };
  writeJsonFile('roommates.json', data);
  res.json(data[index]);
});

app.delete('/api/roommates/:id', requireRole(['supervisor', 'system_admin']), (req, res) => {
  const role = req.headers['x-role'];
  const floorId = req.headers['x-floor-id'];
  
  let data = readJsonFile('roommates.json', []);
  const roommate = data.find(r => r.id === req.params.id);
  
  if (!roommate) {
    return res.status(404).json({ error: '室友不存在' });
  }
  
  if (role === 'supervisor' && roommate.floorId !== floorId) {
    return res.status(403).json({ error: '只能删除自己楼层的成员' });
  }
  
  data = data.filter(r => r.id !== req.params.id);
  writeJsonFile('roommates.json', data);
  res.json({ success: true });
});

app.get('/api/schedule', requireMinRole('member'), (req, res) => {
  const role = req.headers['x-role'];
  const floorId = req.headers['x-floor-id'];
  const dormId = req.headers['x-dorm-id'];
  
  let data = readJsonFile('schedule.json', []);
  
  if (role !== 'system_admin') {
    data = data.filter(s => {
      if (role === 'supervisor' && floorId) {
        return true;
      }
      if ((role === 'dorm_admin' || role === 'member') && dormId) {
        return true;
      }
      return false;
    });
  }
  
  res.json(data);
});

app.post('/api/schedule', requireRole(['dorm_admin', 'system_admin']), (req, res) => {
  const data = readJsonFile('schedule.json', []);
  const newSchedule = {
    id: generateId(),
    roommateId: req.body.roommateId,
    roommateName: req.body.roommateName,
    date: req.body.date,
    task: req.body.task,
    completed: false,
    isRecurring: req.body.isRecurring || false,
    createdAt: new Date().toISOString(),
    createdBy: req.headers['x-username'] || 'system'
  };
  data.push(newSchedule);
  writeJsonFile('schedule.json', data);
  res.json(newSchedule);
});

app.put('/api/schedule/:id', requireRole(['dorm_admin', 'system_admin']), (req, res) => {
  const data = readJsonFile('schedule.json', []);
  const index = data.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '排班不存在' });
  }
  data[index] = { ...data[index], ...req.body, updatedAt: new Date().toISOString() };
  writeJsonFile('schedule.json', data);
  res.json(data[index]);
});

app.delete('/api/schedule/:id', requireRole(['dorm_admin', 'system_admin']), (req, res) => {
  let data = readJsonFile('schedule.json', []);
  const beforeLength = data.length;
  data = data.filter(s => s.id !== req.params.id);
  if (data.length === beforeLength) {
    return res.status(404).json({ error: '排班不存在' });
  }
  writeJsonFile('schedule.json', data);
  res.json({ success: true });
});

app.get('/api/bills', requireMinRole('member'), (req, res) => {
  const role = req.headers['x-role'];
  const floorId = req.headers['x-floor-id'];
  const dormId = req.headers['x-dorm-id'];
  
  let data = readJsonFile('bills.json', []);
  
  if (role !== 'system_admin') {
    data = data.filter(b => {
      if (role === 'supervisor' && floorId) {
        return true;
      }
      if ((role === 'dorm_admin' || role === 'member') && dormId) {
        return true;
      }
      return false;
    });
  }
  
  res.json(data);
});

app.post('/api/bills', requireRole(['dorm_admin', 'system_admin']), (req, res) => {
  const data = readJsonFile('bills.json', []);
  const newBill = {
    id: generateId(),
    title: req.body.title,
    amount: parseFloat(req.body.amount),
    payerId: req.body.payerId,
    payerName: req.body.payerName,
    participants: req.body.participants || [],
    date: req.body.date || new Date().toISOString().split('T')[0],
    type: req.body.type || 'expense',
    note: req.body.note || '',
    createdAt: new Date().toISOString(),
    createdBy: req.headers['x-username'] || 'system'
  };
  data.push(newBill);
  writeJsonFile('bills.json', data);
  res.json(newBill);
});

app.put('/api/bills/:id', requireRole(['dorm_admin', 'system_admin']), (req, res) => {
  const data = readJsonFile('bills.json', []);
  const index = data.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '账单不存在' });
  }
  data[index] = { ...data[index], ...req.body, updatedAt: new Date().toISOString() };
  writeJsonFile('bills.json', data);
  res.json(data[index]);
});

app.delete('/api/bills/:id', requireRole(['dorm_admin', 'system_admin']), (req, res) => {
  let data = readJsonFile('bills.json', []);
  const beforeLength = data.length;
  data = data.filter(b => b.id !== req.params.id);
  if (data.length === beforeLength) {
    return res.status(404).json({ error: '账单不存在' });
  }
  writeJsonFile('bills.json', data);
  res.json({ success: true });
});

app.get('/api/electricity', requireMinRole('supervisor'), (req, res) => {
  const role = req.headers['x-role'];
  const floorId = req.headers['x-floor-id'];
  
  let data = readJsonFile('electricity.json', []);
  
  if (role === 'supervisor' && floorId) {
    data = data.slice(-30);
  }
  
  res.json(data);
});

app.post('/api/electricity', requireRole(['dorm_admin', 'system_admin']), (req, res) => {
  const data = readJsonFile('electricity.json', []);
  const newRecord = {
    id: generateId(),
    date: req.body.date || new Date().toISOString().split('T')[0],
    usage: parseFloat(req.body.usage),
    cost: parseFloat(req.body.cost),
    note: req.body.note || '',
    createdAt: new Date().toISOString(),
    createdBy: req.headers['x-username'] || 'system'
  };
  data.push(newRecord);
  writeJsonFile('electricity.json', data);
  res.json(newRecord);
});

app.put('/api/electricity/:id', requireRole(['dorm_admin', 'system_admin']), (req, res) => {
  const data = readJsonFile('electricity.json', []);
  const index = data.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '用电记录不存在' });
  }
  data[index] = { ...data[index], ...req.body, updatedAt: new Date().toISOString() };
  writeJsonFile('electricity.json', data);
  res.json(data[index]);
});

app.delete('/api/electricity/:id', requireRole(['dorm_admin', 'system_admin']), (req, res) => {
  let data = readJsonFile('electricity.json', []);
  const beforeLength = data.length;
  data = data.filter(e => e.id !== req.params.id);
  if (data.length === beforeLength) {
    return res.status(404).json({ error: '用电记录不存在' });
  }
  writeJsonFile('electricity.json', data);
  res.json({ success: true });
});

app.get('/api/items', requireMinRole('member'), (req, res) => {
  const role = req.headers['x-role'];
  const floorId = req.headers['x-floor-id'];
  const dormId = req.headers['x-dorm-id'];
  
  let data = readJsonFile('items.json', []);
  
  if (role !== 'system_admin') {
    data = data.filter(i => {
      if (role === 'supervisor' && floorId) {
        return true;
      }
      if ((role === 'dorm_admin' || role === 'member') && dormId) {
        return true;
      }
      return false;
    });
  }
  
  res.json(data);
});

app.post('/api/items', requireRole(['dorm_admin', 'system_admin']), (req, res) => {
  const data = readJsonFile('items.json', []);
  const newItem = {
    id: generateId(),
    name: req.body.name,
    ownerId: req.body.ownerId,
    ownerName: req.body.ownerName,
    borrowerId: null,
    borrowerName: null,
    status: 'available',
    location: req.body.location || '',
    note: req.body.note || '',
    createdAt: new Date().toISOString(),
    createdBy: req.headers['x-username'] || 'system'
  };
  data.push(newItem);
  writeJsonFile('items.json', data);
  res.json(newItem);
});

app.put('/api/items/:id', requireRole(['dorm_admin', 'system_admin', 'member']), (req, res) => {
  const role = req.headers['x-role'];
  const data = readJsonFile('items.json', []);
  const index = data.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '物品不存在' });
  }
  
  if (role === 'member' && req.body.status === 'borrowed') {
    data[index] = { ...data[index], ...req.body };
    writeJsonFile('items.json', data);
    return res.json(data[index]);
  }
  
  if (role !== 'dorm_admin' && role !== 'system_admin') {
    return res.status(403).json({ error: '权限不足' });
  }
  
  data[index] = { ...data[index], ...req.body, updatedAt: new Date().toISOString() };
  writeJsonFile('items.json', data);
  res.json(data[index]);
});

app.delete('/api/items/:id', requireRole(['dorm_admin', 'system_admin']), (req, res) => {
  let data = readJsonFile('items.json', []);
  const beforeLength = data.length;
  data = data.filter(i => i.id !== req.params.id);
  if (data.length === beforeLength) {
    return res.status(404).json({ error: '物品不存在' });
  }
  writeJsonFile('items.json', data);
  res.json({ success: true });
});

app.get('/api/items/:id/borrow', requireRole(['member', 'dorm_admin', 'system_admin']), (req, res) => {
  const data = readJsonFile('items.json', []);
  const item = data.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: '物品不存在' });
  }
  if (item.status !== 'available') {
    return res.status(400).json({ error: '物品不可借用' });
  }
  item.status = 'borrowed';
  item.borrowerId = req.query.borrowerId;
  item.borrowerName = req.query.borrowerName;
  item.borrowDate = new Date().toISOString();
  writeJsonFile('items.json', data);
  res.json(item);
});

app.get('/api/items/:id/return', requireRole(['member', 'dorm_admin', 'system_admin']), (req, res) => {
  const data = readJsonFile('items.json', []);
  const item = data.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: '物品不存在' });
  }
  item.status = 'available';
  item.borrowerId = null;
  item.borrowerName = null;
  item.borrowDate = null;
  writeJsonFile('items.json', data);
  res.json(item);
});

app.get('/api/beds', requireMinRole('member'), (req, res) => {
  const role = req.headers['x-role'];
  const floorId = req.headers['x-floor-id'];
  const dormId = req.headers['x-dorm-id'];
  
  let data = readJsonFile('beds.json', []);
  
  if (role !== 'system_admin') {
    data = data.filter(b => {
      if (role === 'supervisor' && floorId) {
        return b.floorId === floorId;
      }
      if ((role === 'dorm_admin' || role === 'member') && dormId) {
        return b.dormId === dormId;
      }
      return false;
    });
  }
  
  res.json(data);
});

app.post('/api/beds', requireRole(['supervisor', 'system_admin']), (req, res) => {
  const role = req.headers['x-role'];
  const floorId = req.headers['x-floor-id'];
  const dormId = req.body.dormId;
  
  if (role === 'supervisor') {
    const buildingsData = readJsonFile('buildings.json', { floors: [], dormitories: [], invites: [] });
    const dorm = buildingsData.dormitories.find(d => d.id === dormId);
    if (!dorm || dorm.floorId !== floorId) {
      return res.status(403).json({ error: '只能创建自己楼层的床位' });
    }
  }
  
  const data = readJsonFile('beds.json', []);
  const newBed = {
    id: generateId(),
    dormId: dormId,
    floorId: req.body.floorId,
    bedNumber: req.body.bedNumber,
    status: req.body.status || 'empty',
    occupantName: req.body.occupantName || '',
    occupantId: req.body.occupantId || '',
    checkInDate: req.body.checkInDate || '',
    createdAt: new Date().toISOString(),
    createdBy: req.headers['x-username'] || 'system'
  };
  data.push(newBed);
  writeJsonFile('beds.json', data);
  res.json(newBed);
});

app.put('/api/beds/:id', requireRole(['supervisor', 'system_admin']), (req, res) => {
  const role = req.headers['x-role'];
  const floorId = req.headers['x-floor-id'];
  
  const data = readJsonFile('beds.json', []);
  const index = data.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '床位不存在' });
  }
  
  if (role === 'supervisor' && data[index].floorId !== floorId) {
    return res.status(403).json({ error: '只能修改自己楼层的床位' });
  }
  
  data[index] = { ...data[index], ...req.body, updatedAt: new Date().toISOString() };
  writeJsonFile('beds.json', data);
  res.json(data[index]);
});

app.delete('/api/beds/:id', requireRole(['supervisor', 'system_admin']), (req, res) => {
  const role = req.headers['x-role'];
  const floorId = req.headers['x-floor-id'];
  
  let data = readJsonFile('beds.json', []);
  const bed = data.find(b => b.id === req.params.id);
  
  if (!bed) {
    return res.status(404).json({ error: '床位不存在' });
  }
  
  if (role === 'supervisor' && bed.floorId !== floorId) {
    return res.status(403).json({ error: '只能删除自己楼层的床位' });
  }
  
  data = data.filter(b => b.id !== req.params.id);
  writeJsonFile('beds.json', data);
  res.json({ success: true });
});

app.get('/api/repairs', requireMinRole('member'), (req, res) => {
  const role = req.headers['x-role'];
  const floorId = req.headers['x-floor-id'];
  const dormId = req.headers['x-dorm-id'];
  
  let data = readJsonFile('repairs.json', []);
  
  if (role !== 'system_admin') {
    data = data.filter(r => {
      if (role === 'supervisor' && floorId) {
        return true;
      }
      if ((role === 'dorm_admin' || role === 'member') && dormId) {
        return true;
      }
      return false;
    });
  }
  
  res.json(data);
});

app.post('/api/repairs', requireRole(['member', 'dorm_admin', 'system_admin', 'supervisor']), (req, res) => {
  const data = readJsonFile('repairs.json', []);
  const newRepair = {
    id: generateId(),
    title: req.body.title,
    category: req.body.category || 'other',
    priority: req.body.priority || 'medium',
    description: req.body.description || '',
    reporter: req.body.reporter,
    status: 'pending',
    createdAt: new Date().toISOString(),
    createdBy: req.headers['x-username'] || req.body.reporter || 'anonymous'
  };
  data.push(newRepair);
  writeJsonFile('repairs.json', data);
  res.json(newRepair);
});

app.put('/api/repairs/:id', requireRole(['dorm_admin', 'system_admin', 'supervisor']), (req, res) => {
  const data = readJsonFile('repairs.json', []);
  const index = data.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '报修记录不存在' });
  }
  data[index] = { ...data[index], ...req.body, updatedAt: new Date().toISOString() };
  writeJsonFile('repairs.json', data);
  res.json(data[index]);
});

app.delete('/api/repairs/:id', requireRole(['dorm_admin', 'system_admin']), (req, res) => {
  let data = readJsonFile('repairs.json', []);
  const beforeLength = data.length;
  data = data.filter(r => r.id !== req.params.id);
  if (data.length === beforeLength) {
    return res.status(404).json({ error: '报修记录不存在' });
  }
  writeJsonFile('repairs.json', data);
  res.json({ success: true });
});

app.get('/api/clean', requireMinRole('supervisor'), (req, res) => {
  const role = req.headers['x-role'];
  const floorId = req.headers['x-floor-id'];
  const dormId = req.headers['x-dorm-id'];
  
  let data = readJsonFile('clean.json', []);
  
  if (role !== 'system_admin') {
    data = data.filter(c => {
      if (role === 'supervisor' && floorId) {
        return true;
      }
      if ((role === 'dorm_admin' || role === 'member') && dormId) {
        return true;
      }
      return false;
    });
  }
  
  res.json(data);
});

app.post('/api/clean', requireRole(['dorm_admin', 'system_admin', 'supervisor']), (req, res) => {
  const data = readJsonFile('clean.json', []);
  const newClean = {
    id: generateId(),
    date: req.body.date || new Date().toISOString().split('T')[0],
    score: parseInt(req.body.score),
    note: req.body.note || '',
    createdAt: new Date().toISOString(),
    createdBy: req.headers['x-username'] || 'system'
  };
  data.push(newClean);
  writeJsonFile('clean.json', data);
  res.json(newClean);
});

app.put('/api/clean/:id', requireRole(['dorm_admin', 'system_admin', 'supervisor']), (req, res) => {
  const data = readJsonFile('clean.json', []);
  const index = data.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '评分记录不存在' });
  }
  data[index] = { ...data[index], ...req.body, updatedAt: new Date().toISOString() };
  writeJsonFile('clean.json', data);
  res.json(data[index]);
});

app.delete('/api/clean/:id', requireRole(['dorm_admin', 'system_admin']), (req, res) => {
  let data = readJsonFile('clean.json', []);
  const beforeLength = data.length;
  data = data.filter(c => c.id !== req.params.id);
  if (data.length === beforeLength) {
    return res.status(404).json({ error: '评分记录不存在' });
  }
  writeJsonFile('clean.json', data);
  res.json({ success: true });
});

app.get('/api/backup', requireRole(['system_admin']), (req, res) => {
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename=dorminone-backup-${Date.now()}.zip`);
  
  archive.pipe(res);
  archive.directory(DATA_DIR, 'data');
  archive.finalize();
});

app.post('/api/restore', requireRole(['system_admin']), (req, res) => {
  res.json({ success: true, message: '恢复功能需要文件上传支持' });
});

app.post('/api/utilities', requireRole(['dorm_admin', 'system_admin']), (req, res) => {
  const { type, reading, date, rate } = req.body;
  const data = readJsonFile('electricity.json', []);
  
  const newRecord = {
    id: generateId(),
    date: date || new Date().toISOString().split('T')[0],
    type: type || 'electric',
    reading: parseFloat(reading),
    rate: parseFloat(rate) || 0.617,
    usage: 0,
    cost: 0,
    createdAt: new Date().toISOString(),
    createdBy: req.headers['x-username'] || 'system'
  };
  
  data.push(newRecord);
  writeJsonFile('electricity.json', data);
  
  const billsData = readJsonFile('bills.json', []);
  const bill = {
    id: generateId(),
    title: type === 'water' ? '水费' : '电费',
    amount: parseFloat(reading) * (parseFloat(rate) || 0.617),
    payerId: '',
    payerName: '宿舍集体',
    participants: [],
    date: newRecord.date,
    type: 'expense',
    note: `${type === 'water' ? '水' : '电'}表读数: ${reading}`,
    createdAt: new Date().toISOString(),
    createdBy: req.headers['x-username'] || 'system'
  };
  billsData.push(bill);
  writeJsonFile('bills.json', billsData);
  
  res.json({ success: true, record: newRecord, bill });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});