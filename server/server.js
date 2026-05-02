const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

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

// 室友管理接口
app.get('/api/roommates', (req, res) => {
  const data = readJsonFile('roommates.json', []);
  res.json(data);
});

app.post('/api/roommates', (req, res) => {
  const data = readJsonFile('roommates.json', []);
  const newRoommate = {
    id: generateId(),
    name: req.body.name,
    avatar: req.body.avatar || '',
    phone: req.body.phone || '',
    role: req.body.role || 'member',
    createdAt: new Date().toISOString()
  };
  data.push(newRoommate);
  writeJsonFile('roommates.json', data);
  res.json(newRoommate);
});

app.put('/api/roommates/:id', (req, res) => {
  const data = readJsonFile('roommates.json', []);
  const index = data.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '室友不存在' });
  }
  data[index] = { ...data[index], ...req.body };
  writeJsonFile('roommates.json', data);
  res.json(data[index]);
});

app.delete('/api/roommates/:id', (req, res) => {
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

app.post('/api/schedule', (req, res) => {
  const data = readJsonFile('schedule.json', []);
  const newSchedule = {
    id: generateId(),
    roommateId: req.body.roommateId,
    roommateName: req.body.roommateName,
    date: req.body.date,
    task: req.body.task,
    completed: false,
    createdAt: new Date().toISOString()
  };
  data.push(newSchedule);
  writeJsonFile('schedule.json', data);
  res.json(newSchedule);
});

app.put('/api/schedule/:id', (req, res) => {
  const data = readJsonFile('schedule.json', []);
  const index = data.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '排班不存在' });
  }
  data[index] = { ...data[index], ...req.body };
  writeJsonFile('schedule.json', data);
  res.json(data[index]);
});

app.delete('/api/schedule/:id', (req, res) => {
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

app.post('/api/bills', (req, res) => {
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
    createdAt: new Date().toISOString()
  };
  data.push(newBill);
  writeJsonFile('bills.json', data);
  res.json(newBill);
});

app.put('/api/bills/:id', (req, res) => {
  const data = readJsonFile('bills.json', []);
  const index = data.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '账单不存在' });
  }
  data[index] = { ...data[index], ...req.body };
  writeJsonFile('bills.json', data);
  res.json(data[index]);
});

app.delete('/api/bills/:id', (req, res) => {
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

app.post('/api/electricity', (req, res) => {
  const data = readJsonFile('electricity.json', []);
  const newRecord = {
    id: generateId(),
    date: req.body.date || new Date().toISOString().split('T')[0],
    usage: parseFloat(req.body.usage),
    cost: parseFloat(req.body.cost),
    note: req.body.note || '',
    createdAt: new Date().toISOString()
  };
  data.push(newRecord);
  writeJsonFile('electricity.json', data);
  res.json(newRecord);
});

app.put('/api/electricity/:id', (req, res) => {
  const data = readJsonFile('electricity.json', []);
  const index = data.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '用电记录不存在' });
  }
  data[index] = { ...data[index], ...req.body };
  writeJsonFile('electricity.json', data);
  res.json(data[index]);
});

app.delete('/api/electricity/:id', (req, res) => {
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

app.post('/api/items', (req, res) => {
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
    createdAt: new Date().toISOString()
  };
  data.push(newItem);
  writeJsonFile('items.json', data);
  res.json(newItem);
});

app.put('/api/items/:id', (req, res) => {
  const data = readJsonFile('items.json', []);
  const index = data.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '物品不存在' });
  }
  data[index] = { ...data[index], ...req.body };
  writeJsonFile('items.json', data);
  res.json(data[index]);
});

app.delete('/api/items/:id', (req, res) => {
  let data = readJsonFile('items.json', []);
  const beforeLength = data.length;
  data = data.filter(i => i.id !== req.params.id);
  if (data.length === beforeLength) {
    return res.status(404).json({ error: '物品不存在' });
  }
  writeJsonFile('items.json', data);
  res.json({ success: true });
});

app.get('/api/items/:id/borrow', (req, res) => {
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

app.get('/api/items/:id/return', (req, res) => {
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

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
