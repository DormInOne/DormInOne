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

// 认证接口
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const authData = readJsonFile('auth.json', {});
  
  const user = Object.values(authData).find(u => u.username === username && u.password === password);
  
  if (user) {
    res.json({ success: true, role: user.role, username: user.username });
  } else {
    res.status(401).json({ success: false, message: '用户名或密码错误' });
  }
});

app.get('/api/validate', (req, res) => {
  res.json({ success: true });
});

// 角色校验中间件
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

// 室友管理接口
app.get('/api/roommates', (req, res) => {
  const data = readJsonFile('roommates.json', []);
  res.json(data);
});

app.post('/api/roommates', requireRole(['admin']), (req, res) => {
  const data = readJsonFile('roommates.json', []);
  const newRoommate = {
    id: generateId(),
    name: req.body.name,
    avatar: req.body.avatar || '',
    phone: req.body.phone || '',
    role: req.body.role || 'member',
    createdAt: new Date().toISOString(),
    createdBy: req.headers['x-username'] || 'system'
  };
  data.push(newRoommate);
  writeJsonFile('roommates.json', data);
  res.json(newRoommate);
});

app.put('/api/roommates/:id', requireRole(['admin']), (req, res) => {
  const data = readJsonFile('roommates.json', []);
  const index = data.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '室友不存在' });
  }
  data[index] = { ...data[index], ...req.body, updatedAt: new Date().toISOString() };
  writeJsonFile('roommates.json', data);
  res.json(data[index]);
});

app.delete('/api/roommates/:id', requireRole(['admin']), (req, res) => {
  let data = readJsonFile('roommates.json', []);
  const beforeLength = data.length;
  data = data.filter(r => r.id !== req.params.id);
  if (data.length === beforeLength) {
    return res.status(404).json({ error: '室友不存在' });
  }
  writeJsonFile('roommates.json', data);
  res.json({ success: true });
});

// 值日排班接口
app.get('/api/schedule', (req, res) => {
  const data = readJsonFile('schedule.json', []);
  res.json(data);
});

app.post('/api/schedule', requireRole(['admin']), (req, res) => {
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

app.put('/api/schedule/:id', requireRole(['admin']), (req, res) => {
  const data = readJsonFile('schedule.json', []);
  const index = data.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '排班不存在' });
  }
  data[index] = { ...data[index], ...req.body, updatedAt: new Date().toISOString() };
  writeJsonFile('schedule.json', data);
  res.json(data[index]);
});

app.delete('/api/schedule/:id', requireRole(['admin']), (req, res) => {
  let data = readJsonFile('schedule.json', []);
  const beforeLength = data.length;
  data = data.filter(s => s.id !== req.params.id);
  if (data.length === beforeLength) {
    return res.status(404).json({ error: '排班不存在' });
  }
  writeJsonFile('schedule.json', data);
  res.json({ success: true });
});

// AA记账接口
app.get('/api/bills', (req, res) => {
  const data = readJsonFile('bills.json', []);
  res.json(data);
});

app.post('/api/bills', requireRole(['admin']), (req, res) => {
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

app.put('/api/bills/:id', requireRole(['admin']), (req, res) => {
  const data = readJsonFile('bills.json', []);
  const index = data.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '账单不存在' });
  }
  data[index] = { ...data[index], ...req.body, updatedAt: new Date().toISOString() };
  writeJsonFile('bills.json', data);
  res.json(data[index]);
});

app.delete('/api/bills/:id', requireRole(['admin']), (req, res) => {
  let data = readJsonFile('bills.json', []);
  const beforeLength = data.length;
  data = data.filter(b => b.id !== req.params.id);
  if (data.length === beforeLength) {
    return res.status(404).json({ error: '账单不存在' });
  }
  writeJsonFile('bills.json', data);
  res.json({ success: true });
});

// 用电监控接口
app.get('/api/electricity', (req, res) => {
  const data = readJsonFile('electricity.json', []);
  res.json(data);
});

app.post('/api/electricity', requireRole(['admin']), (req, res) => {
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

app.put('/api/electricity/:id', requireRole(['admin']), (req, res) => {
  const data = readJsonFile('electricity.json', []);
  const index = data.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '用电记录不存在' });
  }
  data[index] = { ...data[index], ...req.body, updatedAt: new Date().toISOString() };
  writeJsonFile('electricity.json', data);
  res.json(data[index]);
});

app.delete('/api/electricity/:id', requireRole(['admin']), (req, res) => {
  let data = readJsonFile('electricity.json', []);
  const beforeLength = data.length;
  data = data.filter(e => e.id !== req.params.id);
  if (data.length === beforeLength) {
    return res.status(404).json({ error: '用电记录不存在' });
  }
  writeJsonFile('electricity.json', data);
  res.json({ success: true });
});

// 物品借用接口
app.get('/api/items', (req, res) => {
  const data = readJsonFile('items.json', []);
  res.json(data);
});

app.post('/api/items', requireRole(['admin']), (req, res) => {
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

app.put('/api/items/:id', requireRole(['admin', 'member']), (req, res) => {
  const role = req.headers['x-role'] || 'member';
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
  
  if (role !== 'admin') {
    return res.status(403).json({ error: '权限不足' });
  }
  
  data[index] = { ...data[index], ...req.body, updatedAt: new Date().toISOString() };
  writeJsonFile('items.json', data);
  res.json(data[index]);
});

app.delete('/api/items/:id', requireRole(['admin']), (req, res) => {
  let data = readJsonFile('items.json', []);
  const beforeLength = data.length;
  data = data.filter(i => i.id !== req.params.id);
  if (data.length === beforeLength) {
    return res.status(404).json({ error: '物品不存在' });
  }
  writeJsonFile('items.json', data);
  res.json({ success: true });
});

app.get('/api/items/:id/borrow', requireRole(['member', 'admin']), (req, res) => {
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

app.get('/api/items/:id/return', requireRole(['member', 'admin']), (req, res) => {
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

// 床位管理接口
app.get('/api/beds', (req, res) => {
  const data = readJsonFile('beds.json', []);
  res.json(data);
});

app.post('/api/beds', requireRole(['admin']), (req, res) => {
  const data = readJsonFile('beds.json', []);
  const newBed = {
    id: generateId(),
    roomNumber: req.body.roomNumber,
    bedNumber: req.body.bedNumber,
    status: req.body.status || 'empty',
    occupantName: req.body.occupantName || '',
    checkInDate: req.body.checkInDate || '',
    createdAt: new Date().toISOString(),
    createdBy: req.headers['x-username'] || 'system'
  };
  data.push(newBed);
  writeJsonFile('beds.json', data);
  res.json(newBed);
});

app.put('/api/beds/:id', requireRole(['admin']), (req, res) => {
  const data = readJsonFile('beds.json', []);
  const index = data.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '床位不存在' });
  }
  data[index] = { ...data[index], ...req.body, updatedAt: new Date().toISOString() };
  writeJsonFile('beds.json', data);
  res.json(data[index]);
});

app.delete('/api/beds/:id', requireRole(['admin']), (req, res) => {
  let data = readJsonFile('beds.json', []);
  const beforeLength = data.length;
  data = data.filter(b => b.id !== req.params.id);
  if (data.length === beforeLength) {
    return res.status(404).json({ error: '床位不存在' });
  }
  writeJsonFile('beds.json', data);
  res.json({ success: true });
});

// 报修管理接口
app.get('/api/repairs', (req, res) => {
  const data = readJsonFile('repairs.json', []);
  res.json(data);
});

app.post('/api/repairs', requireRole(['member', 'admin', 'supervisor']), (req, res) => {
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

app.put('/api/repairs/:id', requireRole(['admin', 'supervisor']), (req, res) => {
  const data = readJsonFile('repairs.json', []);
  const index = data.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '报修记录不存在' });
  }
  data[index] = { ...data[index], ...req.body, updatedAt: new Date().toISOString() };
  writeJsonFile('repairs.json', data);
  res.json(data[index]);
});

app.delete('/api/repairs/:id', requireRole(['admin']), (req, res) => {
  let data = readJsonFile('repairs.json', []);
  const beforeLength = data.length;
  data = data.filter(r => r.id !== req.params.id);
  if (data.length === beforeLength) {
    return res.status(404).json({ error: '报修记录不存在' });
  }
  writeJsonFile('repairs.json', data);
  res.json({ success: true });
});

// 卫生评分接口
app.get('/api/clean', (req, res) => {
  const data = readJsonFile('clean.json', []);
  res.json(data);
});

app.post('/api/clean', requireRole(['admin', 'supervisor']), (req, res) => {
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

app.put('/api/clean/:id', requireRole(['admin', 'supervisor']), (req, res) => {
  const data = readJsonFile('clean.json', []);
  const index = data.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '评分记录不存在' });
  }
  data[index] = { ...data[index], ...req.body, updatedAt: new Date().toISOString() };
  writeJsonFile('clean.json', data);
  res.json(data[index]);
});

app.delete('/api/clean/:id', requireRole(['admin']), (req, res) => {
  let data = readJsonFile('clean.json', []);
  const beforeLength = data.length;
  data = data.filter(c => c.id !== req.params.id);
  if (data.length === beforeLength) {
    return res.status(404).json({ error: '评分记录不存在' });
  }
  writeJsonFile('clean.json', data);
  res.json({ success: true });
});

// 备份接口
app.get('/api/backup', requireRole(['admin']), (req, res) => {
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename=dorminone-backup-${Date.now()}.zip`);
  
  archive.pipe(res);
  archive.directory(DATA_DIR, 'data');
  archive.finalize();
});

app.post('/api/restore', requireRole(['admin']), (req, res) => {
  res.json({ success: true, message: '恢复功能需要文件上传支持' });
});

// 水电表录入接口
app.post('/api/utilities', requireRole(['admin']), (req, res) => {
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
  
  // 自动生成账单
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
