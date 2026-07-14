const fs = require('fs');
const path = require('path');
const files = [
  'src/pages/AdminDashboard.jsx',
  'src/pages/AdminOrders.jsx',
  'src/pages/CustomerDashboard.jsx',
  'src/pages/MyOrders.jsx',
  'src/pages/superAdmin/PaymentManagement.jsx',
  'src/pages/superAdmin/SubscriptionPlans.jsx',
  'src/pages/superAdmin/SuperAdminDashboard.jsx',
  'src/pages/superAdmin/WarehouseManagement.jsx'
];

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    // Replace \'easeOut\' with 'easeOut'
    const repl1 = content.replace(/\\'easeOut\\'/g, "'easeOut'");
    if (repl1 !== content) {
      content = repl1;
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed ' + file);
    }
  }
});
