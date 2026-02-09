# 修复账户批量选择功能的多选问题

## 问题描述

用户无法在账户列表中同时选择多个账户进行批量操作。每次点击复选框后，之前的选择状态会被清空。

## 问题根源

通过代码分析发现问题位于 `src/public/app.js`：

1. **第 267-272 行** `toggleSelect` 函数：
   ```javascript
   function toggleSelect(id, checked) {
       if (checked) selectedAccounts.add(id);
       else selectedAccounts.delete(id);
       updateBatchDeleteBtn();
       loadAccounts(); // ❌ 问题：重新加载会清空选择
   }
   ```

2. **第 274-282 行** `toggleSelectAll` 函数：
   ```javascript
   function toggleSelectAll(checked) {
       const accounts = window.currentAccountsData || [];
       accounts.forEach(acc => {
           if (checked) selectedAccounts.add(acc.id);
           else selectedAccounts.delete(acc.id);
       });
       updateBatchDeleteBtn();
       loadAccounts(); // ❌ 问题：重新加载会清空选择
   }
   ```

3. **第 258-265 行** `loadAccounts` 函数：
   ```javascript
   async function loadAccounts() {
       try {
           const accounts = await fetchApi('/api/accounts');
           selectedAccounts.clear(); // ❌ 问题：清空所有选择状态
           updateBatchDeleteBtn();
           renderAccountsTable(accounts);
       } catch (e) { console.error(e); }
   }
   ```

**执行流程**：
```
点击复选框 → toggleSelect/toggleSelectAll
→ 修改 selectedAccounts
→ 调用 loadAccounts()
→ selectedAccounts.clear()
→ 所有选择被清空
```

## 修复方案

### 主要修复（方案 1 - 推荐）

**修改 `src/public/app.js`：**

1. **修复 `toggleSelect` 函数**（第 267-272 行）：
   ```javascript
   function toggleSelect(id, checked) {
       if (checked) selectedAccounts.add(id);
       else selectedAccounts.delete(id);
       updateBatchDeleteBtn();
       renderAccountsTable(currentAccountsData); // ✅ 仅重新渲染，不重新加载
   }
   ```

2. **修复 `toggleSelectAll` 函数**（第 274-282 行）：
   ```javascript
   function toggleSelectAll(checked) {
       const accounts = currentAccountsData || [];
       accounts.forEach(acc => {
           if (checked) selectedAccounts.add(acc.id);
           else selectedAccounts.delete(acc.id);
       });
       updateBatchDeleteBtn();
       renderAccountsTable(currentAccountsData); // ✅ 仅重新渲染，不重新加载
   }
   ```

3. **保留 `loadAccounts` 的清空逻辑**（第 258-265 行）：
   ```javascript
   async function loadAccounts() {
       try {
           const accounts = await fetchApi('/api/accounts');
           selectedAccounts.clear(); // ✅ 保留：重新加载数据时清空选择是合理的
           updateBatchDeleteBtn();
           renderAccountsTable(accounts);
       } catch (e) { console.error(e); }
   }
   ```

### 次要修复

**修改 `src/public/components/AccountsTable.js`：**

修复全选复选框状态显示（第 11-16 行）：
```javascript
<input
    type="checkbox"
    id="selectAll"
    checked={props.accounts.length > 0 && props.accounts.every(a => props.selectedAccounts.has(a.id))} // ✅ 添加 checked 属性
    onChange={(e) => props.onSelectAll(e.target.checked)}
    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
/>
```

## 技术细节

### 为什么方案 1 更好？

1. **性能优化**：避免不必要的 API 请求
2. **用户体验**：选择操作响应更快
3. **状态一致性**：选择状态在操作期间保持稳定
4. **代码简洁**：逻辑更清晰，职责分离

### 数据流

**修复前**：
```
用户点击 → 修改状态 → 重新加载 → 清空状态 → 渲染（选择丢失）
```

**修复后**：
```
用户点击 → 修改状态 → 直接渲染（选择保留）
```

## 验收标准

1. ✅ 可以同时选择多个账户
2. ✅ 选择状态在点击后保持不变
3. ✅ 全选复选框正确反映当前状态（全选/部分选择/未选择）
4. ✅ 批量删除按钮显示正确的选中数量
5. ✅ 执行批量删除后，选择状态正确清空
6. ✅ 刷新账户列表后，选择状态正确清空

## 影响范围

- **修改文件**：
  - `src/public/app.js`（2 个函数，共 6 行代码）
  - `src/public/components/AccountsTable.js`（1 行代码）

- **不影响**：
  - 后端 API
  - 其他前端功能
  - 数据库结构

## 测试计划

### 手动测试

1. **基本多选测试**：
   - 打开账户列表页面
   - 点击第一个账户的复选框 → 验证选中
   - 点击第二个账户的复选框 → 验证两个都选中
   - 点击第三个账户的复选框 → 验证三个都选中

2. **全选测试**：
   - 点击表头的全选复选框 → 验证所有账户被选中
   - 再次点击全选复选框 → 验证所有账户取消选中
   - 手动选择部分账户 → 点击全选 → 验证所有账户被选中

3. **批量删除测试**：
   - 选择多个账户
   - 点击"批量删除"按钮
   - 确认删除 → 验证账户被删除且选择状态清空

4. **刷新测试**：
   - 选择多个账户
   - 点击"刷新"按钮 → 验证选择状态被清空（预期行为）

5. **边界测试**：
   - 只有一个账户时的全选
   - 选择所有账户后取消一个
   - 快速连续点击多个复选框

## 实施步骤

1. 备份当前代码（可选）
2. 修改 `src/public/app.js` 中的 `toggleSelect` 函数
3. 修改 `src/public/app.js` 中的 `toggleSelectAll` 函数
4. 修改 `src/public/components/AccountsTable.js` 中的全选复选框
5. 测试所有场景
6. 提交代码

## 风险评估

- **风险等级**：低
- **影响范围**：仅限账户选择功能
- **回滚方案**：恢复原代码即可

## 相关代码位置

- `src/public/app.js:267-272` - toggleSelect 函数
- `src/public/app.js:274-282` - toggleSelectAll 函数
- `src/public/app.js:258-265` - loadAccounts 函数
- `src/public/components/AccountsTable.js:11-16` - 全选复选框
- `src/public/components/AccountsTable.js:30-36` - 单个复选框
