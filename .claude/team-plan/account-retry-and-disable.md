# Team Plan: Account Retry and Auto-Disable on Suspension/Quota Failure

## 概述
实现账号 suspended 或刷新额度失败时的自动重试其他账号和禁用失效账号功能

## Codex 分析摘要

**技术可行性：高** - 现有架构已具备换号重试和账号状态机基础

**关键发现：**
1. 已有换号重试机制（`src/routes/api.js:109` retry loop + `triedAccountIds`）
2. 已有账号禁用能力（`src/pool.js:259` `disableAccount()`）
3. **缺口：**
   - 401/403 错误当前不会触发 failover（`isRetryableError()` 只处理 429/5xx/网络错误）
   - Token/Quota 刷新失败缺少结构化错误信息（只有文本 Error）
   - 日志记录存在 bug：`addLog()` 使用 `error` 字段但数据库期望 `errorMessage`

**推荐方案：**
1. 新增错误分类器，输出 `{ shouldRetry, shouldDisable, disableReason, isRateLimit }`
2. 扩展 retry loop 支持 401/403 的 failover + 自动禁用
3. 修复日志字段名 bug
4. 让 Token/Usage 错误携带 `status` 字段
5. 持久化禁用原因到 accounts 表（新增 `disabled_reason`、`disabled_at` 字段）

## Gemini 分析摘要

**UI/UX 方案：**（基于代码分析）
1. 在 AccountsTable 中为 `disabled` 状态添加视觉区分
2. 显示禁用原因（tooltip 或额外列）
3. 刷新额度失败时显示友好错误提示
4. 为自动禁用的账号提供快速重新启用入口

**前端改动点：**
- `src/public/components/AccountsTable.js` - 显示禁用原因、优化状态展示
- `src/public/services/accountsService.js` - 无需改动（已有 enable/disable API）
- `src/public/components/AccountsTabShell.js` - 处理刷新失败的 toast 提示

## 技术方案

### 后端架构
1. **错误分类系统**（`src/routes/api.js`）
   - 新增 `classifyError(error)` 函数
   - 识别 suspended（403 + 关键词）、token 失败（401/403）、rate limit（429）

2. **自动禁用机制**
   - 请求路径：retry loop 中检测到 `shouldDisable` 时调用 `disableAccount()`
   - 管理路径：`refreshAccountUsage()` 失败时自动禁用

3. **数据库扩展**
   - accounts 表新增：`disabled_reason TEXT`、`disabled_at TEXT`
   - 迁移逻辑：`DatabaseManager._migrateDatabase()` 自动添加列

4. **结构化错误**
   - `src/token.js` 错误附加 `status`、`source`、`responseText`
   - `src/usage.js` 错误附加相同字段

### 前端架构
1. **状态展示增强**
   - AccountsTable 显示禁用原因（tooltip）
   - 区分"手动禁用"和"自动禁用"

2. **错误提示优化**
   - 刷新额度失败时显示具体原因
   - 自动禁用时发送 toast 通知

## 子任务列表

### Task 1: 修复日志字段 bug
- **类型**: 后端
- **文件范围**: `src/routes/api.js`
- **依赖**: 无
- **实施步骤**:
  1. 定位 `addLog()` 调用（约 150、571、720 行）
  2. 将 `error: error.message` 改为 `errorMessage: error.message`
  3. 验证失败日志能正确写入 `request_logs.error_message`
- **验收标准**: 触发请求失败后，数据库 `request_logs` 表的 `error_message` 字段有内容

### Task 2: 实现错误分类器
- **类型**: 后端
- **文件范围**: `src/routes/api.js`
- **依赖**: 无
- **实施步骤**:
  1. 在 `src/routes/api.js` 顶部新增 `classifyError(error)` 函数
  2. 返回对象：`{ shouldRetry: boolean, shouldDisable: boolean, disableReason: string, isRateLimit: boolean }`
  3. 分类逻辑：
     - `status === 403` + `message.includes('suspend')` → `shouldDisable=true, shouldRetry=true`
     - `status === 401/403` (token/auth) → `shouldDisable=true, shouldRetry=true`
     - `status === 429` → `isRateLimit=true, shouldRetry=true`
     - `status >= 500` → `shouldRetry=true`
     - 网络错误 → `shouldRetry=true`
  4. 单元测试（手动）：构造不同错误对象验证分类结果
- **验收标准**: 函数能正确分类 5 种典型错误场景

### Task 3: 扩展数据库 schema
- **类型**: 后端
- **文件范围**: `src/db.js`
- **依赖**: 无
- **实施步骤**:
  1. 在 `DatabaseManager._migrateDatabase()` 中添加列检查逻辑
  2. 检测 `disabled_reason` 和 `disabled_at` 列是否存在
  3. 不存在则执行 `ALTER TABLE accounts ADD COLUMN disabled_reason TEXT NULL`
  4. 执行 `ALTER TABLE accounts ADD COLUMN disabled_at TEXT NULL`
  5. 更新 `getAllAccounts()` 和 `getAccount()` 的 SELECT 语句包含新字段
  6. 更新 `updateAccount()` 支持更新这两个字段
- **验收标准**: 重启服务后，accounts 表包含新字段且不报错

### Task 4: 增强 Pool 禁用方法
- **类型**: 后端
- **文件范围**: `src/pool.js`
- **依赖**: Task 3
- **实施步骤**:
  1. 修改 `disableAccount(id)` 签名为 `disableAccount(id, reason = null)`
  2. 在方法内调用 `this.db.updateAccount(id, { status: 'disabled', disabled_reason: reason, disabled_at: new Date().toISOString() })`
  3. 更新内存中的 account 对象
  4. 修改 `listAccounts()` 返回 `disabledReason` 和 `disabledAt` 字段
- **验收标准**: 调用 `disableAccount(id, 'test reason')` 后，数据库和内存都包含禁用原因

### Task 5: 实现请求路径自动禁用
- **类型**: 后端
- **文件范围**: `src/routes/api.js`
- **依赖**: Task 2, Task 4
- **实施步骤**:
  1. 在 retry loop 的 catch 块（137-168 行）中使用 `classifyError()`
  2. 如果 `shouldDisable === true`：
     - 调用 `state.accountPool.disableAccount(selected.id, disableReason)`
     - 记录日志：`console.log(\`[Auto-Disable] 账号 ${selected.name} 已自动禁用: ${disableReason}\`)`
  3. 修改重试条件：使用 `shouldRetry` 而不是 `isRetryableError(error)`
  4. 保留 `recordError()` 调用，传入 `isRateLimit`
- **验收标准**:
  - 模拟 403 suspended 错误时，账号自动禁用且请求重试其他账号
  - 日志中能看到自动禁用记录

### Task 6: 实现额度刷新路径自动禁用
- **类型**: 后端
- **文件范围**: `src/pool.js`
- **依赖**: Task 2, Task 4
- **实施步骤**:
  1. 在 `refreshAccountUsage()` 的 catch 块（137-140 行）中添加错误分类
  2. 复用 `classifyError()` 或简化版本（识别 401/403/suspended）
  3. 如果 `shouldDisable === true`：
     - 调用 `this.disableAccount(id, '额度刷新失败: ' + e.message)`
  4. 返回的 error 对象保持不变（前端会显示）
- **验收标准**: 管理台刷新额度遇到 401/403 时，账号自动禁用

### Task 7: 增强 Token 错误结构
- **类型**: 后端
- **文件范围**: `src/token.js`
- **依赖**: 无
- **实施步骤**:
  1. 在 `refreshSocialToken()` 的 `!response.ok` 分支（62-65 行）：
     - 创建 Error 后添加：`error.status = response.status`
     - 添加：`error.source = 'token_refresh'`
     - 添加：`error.responseText = error.substring(0, 500)` （截断）
  2. 在 `refreshIdcToken()` 的 `!response.ok` 分支（110-113 行）做相同处理
- **验收标准**: Token 刷新失败时，error 对象包含 `status` 字段

### Task 8: 增强 Usage 错误结构
- **类型**: 后端
- **文件范围**: `src/usage.js`
- **依赖**: 无
- **实施步骤**:
  1. 在 `checkUsageLimits()` 的 `!response.ok` 分支（33-35 行）：
     - 创建 Error 后添加：`error.status = response.status`
     - 添加：`error.source = 'usage_check'`
     - 添加：`error.responseText = error.substring(0, 500)`
- **验收标准**: 额度查询失败时，error 对象包含 `status` 字段

### Task 9: 前端显示禁用原因
- **类型**: 前端
- **文件范围**: `src/public/components/AccountsTable.js`
- **依赖**: Task 4
- **实施步骤**:
  1. 在账号信息列（126-131 行）添加禁用原因显示：
     ```javascript
     {a.status === 'disabled' && a.disabledReason && (
       <div className="text-xs text-rose-500 dark:text-rose-400" title={a.disabledReason}>
         {a.disabledReason.substring(0, 50)}...
       </div>
     )}
     ```
  2. 在 Mobile Card 视图（38-91 行）添加相同逻辑
  3. 为 disabled 状态的行添加视觉区分（淡化背景色）
- **验收标准**:
  - 自动禁用的账号在列表中显示禁用原因
  - 鼠标悬停显示完整原因

### Task 10: 前端优化刷新失败提示
- **类型**: 前端
- **文件范围**: `src/public/app.js` 或相关组件
- **依赖**: Task 6
- **实施步骤**:
  1. 定位刷新额度的调用位置（可能在 AccountsTabShell 或 app.js）
  2. 在 catch 块中检查 `error.message` 是否包含"已自动禁用"
  3. 显示友好的 toast 提示：`账号已自动禁用：${reason}`
  4. 提供"重新启用"按钮快捷入口
- **验收标准**: 刷新失败时显示明确的错误提示和操作建议

## 文件冲突检查
✅ 无冲突 - 所有任务的文件范围已隔离：
- Task 1, 2, 5: `src/routes/api.js` (串行执行)
- Task 3: `src/db.js`
- Task 4, 6: `src/pool.js` (串行执行)
- Task 7: `src/token.js`
- Task 8: `src/usage.js`
- Task 9, 10: 前端文件（独立）

## 并行分组

### Layer 1 (并行执行)
- Task 1: 修复日志字段 bug
- Task 2: 实现错误分类器
- Task 3: 扩展数据库 schema
- Task 7: 增强 Token 错误结构
- Task 8: 增强 Usage 错误结构

### Layer 2 (依赖 Layer 1)
- Task 4: 增强 Pool 禁用方法 (依赖 Task 3)

### Layer 3 (依赖 Layer 2)
- Task 5: 实现请求路径自动禁用 (依赖 Task 2, Task 4)
- Task 6: 实现额度刷新路径自动禁用 (依赖 Task 2, Task 4)

### Layer 4 (依赖 Layer 3)
- Task 9: 前端显示禁用原因 (依赖 Task 4)
- Task 10: 前端优化刷新失败提示 (依赖 Task 6)

## 风险评估

### 1. 误禁用风险 (中)
- **原因**: 依赖字符串匹配可能误判
- **缓解**: 引入 `status` 字段 + 保守的关键词判断；对临时网络/5xx 不禁用

### 2. 容量骤降风险 (中)
- **原因**: 误禁用导致可用账号快速减少
- **缓解**: 保留 `enableAccount` 接口；记录禁用原因便于恢复

### 3. 状态竞争风险 (低-中)
- **原因**: `recordError()` 的 cooldown 机制可能与禁用冲突
- **缓解**: 收紧 rate limit 判定，只认 429

### 4. 信息泄露风险 (中)
- **原因**: 上游 `responseText` 可能含敏感信息
- **缓解**: 禁用原因存储时截断与脱敏

### 5. 回归风险 (中)
- **原因**: 项目无自动化测试
- **缓解**: 手工测试 4 类场景：token 401/403、API 403、429、网络超时

## 实施建议

1. **优先级**: Layer 1 → Layer 2 → Layer 3 → Layer 4
2. **测试策略**: 每完成一个 Layer 进行集成测试
3. **回滚方案**: 保留原有逻辑，通过环境变量控制新功能开关
4. **监控**: 记录自动禁用事件到日志，便于分析误判率
