const mysql = require('mysql');

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'khokhe&duke@mysql89',
  database: 'fmp_tatari_2024'
});

conn.connect((err) => {
  if (err) { console.error('خطأ في الاتصال:', err); process.exit(1); }

  conn.query(
    `SELECT id, number, name, parent_wc_fabric_order_requisition_id, orders_requisitions_id, is_parent, is_deleted, is_active
     FROM wc_fabric_order_requisition
     WHERE number = 1206 AND is_deleted = 0`,
    (err, rows) => {
      if (err) { console.error(err); conn.end(); return; }

      console.log('=== بيانات الطلبية 1206 ===');
      console.log(JSON.stringify(rows, null, 2));

      if (rows.length === 0) { conn.end(); return; }

      const order = rows[0];
      const parentId = order.parent_wc_fabric_order_requisition_id;

      conn.query(
        `SELECT id, number, name, parent_wc_fabric_order_requisition_id, is_parent
         FROM wc_fabric_order_requisition
         WHERE parent_wc_fabric_order_requisition_id = ? AND is_deleted = 0 AND is_active = 1`,
        [parentId],
        (err2, siblings) => {
          if (err2) { console.error(err2); conn.end(); return; }
          console.log('\n=== الطلبيات تحت نفس الأم (parentId=' + parentId + ') ===');
          console.log(JSON.stringify(siblings, null, 2));
          conn.end();
        }
      );
    }
  );
});
