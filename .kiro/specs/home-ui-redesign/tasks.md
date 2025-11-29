# Implementation Plan: Home UI Redesign

- [x] 1. 创建基础组件结构





  - [x] 1.1 创建 HomePage 主组件


    - 创建 `src/components/HomePage.tsx` 文件
    - 实现基础布局容器
    - 集成现有的 hooks（useSerialPort, useMoodProcessor, useMoodAnalytics）
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_

  - [x] 1.2 创建 Header 组件


    - 创建 `src/components/Header.tsx` 文件
    - 实现用户头像按钮（左侧）
    - 实现用户名显示（中间）
    - 实现设置图标按钮（右侧）
    - _Requirements: 6.1_

  - [x] 1.3 创建 MainCharacter 组件


    - 创建 `src/components/MainCharacter.tsx` 文件
    - 实现图片加载和显示逻辑
    - 使用 main.png 作为图片源
    - 添加图片加载错误处理
    - _Requirements: 1.1, 1.2_

  - [ ]* 1.4 编写 MainCharacter 组件的属性测试
    - **Property 1: Main character image aspect ratio preservation**
    - **Validates: Requirements 1.2**

  - [x] 1.5 创建 StarIcon 组件


    - 创建 `src/components/StarIcon.tsx` 文件
    - 实现星星图标显示
    - 使用 star.png 作为图片源
    - 实现水平居中布局
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 1.6 编写 StarIcon 组件的属性测试
    - **Property 2: Star icon horizontal centering**
    - **Property 3: Star icon spacing consistency**
    - **Validates: Requirements 2.2, 2.3**

- [-] 2. 实现 GSR 进度条组件


  - [x] 2.1 创建 GSRProgressBar 组件



    - 创建 `src/components/GSRProgressBar.tsx` 文件
    - 实现进度条容器和填充逻辑
    - 显示最小值（左侧）和最大值（右侧）
    - 实现百分比计算逻辑
    - 添加平滑过渡动画
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 2.2 编写 GSRProgressBar 的属性测试
    - **Property 4: GSR progress bar value accuracy**
    - **Property 5: GSR value display consistency**
    - **Validates: Requirements 3.2, 3.3, 3.4**
- [x] 3. 实现统计卡片组件




- [ ] 3. 实现统计卡片组件

  - [x] 3.1 创建 StatsCardsRow 容器组件


    - 创建 `src/components/StatsCardsRow.tsx` 文件
    - 实现横向布局容器
    - 添加响应式布局（移动端垂直排列）
    - _Requirements: 6.2_

  - [ ]* 3.2 编写 StatsCardsRow 的属性测试
    - **Property 8: Cards layout positioning**
    - **Validates: Requirements 6.2**

  - [x] 3.3 创建 MoodSummaryCard 组件


    - 创建 `src/components/MoodSummaryCard.tsx` 文件
    - 实现卡片基础结构和样式
    - 添加标题"专属情绪总结"
    - 保持与 MoodAnalytics 组件一致的样式
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 3.4 编写 MoodSummaryCard 的属性测试
    - **Property 10: Card styling consistency**
    - **Validates: Requirements 5.3**

  - [x] 3.5 调整 MoodAnalytics 组件样式


    - 修改 `src/components/MoodAnalytics.tsx`
    - 调整卡片样式以适配新布局
    - 确保与 MoodSummaryCard 样式一致
    - _Requirements: 4.1, 4.2, 4.3, 5.3_

  - [ ]* 3.6 编写 MoodAnalytics 的属性测试
    - **Property 6: Mood statistics count accuracy**
    - **Property 7: Mood data display completeness**
    - **Validates: Requirements 4.2, 4.3**
- [x] 4. 整合组件和样式



- [ ] 4. 整合组件和样式

  - [x] 4.1 完成 HomePage 组件集成


    - 在 HomePage 中组装所有子组件
    - 实现垂直布局和间距
    - 添加响应式设计
    - 实现数据流传递
    - _Requirements: 6.1, 6.3_

  - [ ]* 4.2 编写 HomePage 布局的属性测试
    - **Property 9: Vertical layout spacing**
    - **Validates: Requirements 6.1**

  - [x] 4.3 实现全局样式和主题


    - 更新 `index.css` 添加新的样式类
    - 实现渐变背景
    - 确保颜色方案一致
    - 添加响应式断点样式
    - _Requirements: 6.4_

  - [x] 4.4 添加图片资源


    - 确认 main.png 和 star.png 在项目根目录
    - 如需要，优化图片大小和格式
    - 添加图片预加载逻辑
    - _Requirements: 1.1, 2.1_
- [x] 5. 更新路由配置



- [ ] 5. 更新路由配置

  - [x] 5.1 修改 App.tsx 路由


    - 将 HomePage 设置为默认路由 `/`
    - 将现有的 MainPage 移至 `/chat` 路由
    - 保持 `/analytics` 路由不变
    - 添加路由导航逻辑
    - _Requirements: 所有需求_

  - [x] 5.2 实现页面间导航


    - 在 Header 中添加导航到聊天页面的功能
    - 在 MoodAnalytics 中保持导航到详情页面的功能
    - 添加返回主页的导航按钮（在其他页面）
    - _Requirements: 所有需求_

- [ ] 6. Checkpoint - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户

- [ ] 7. 优化和完善
  - [ ] 7.1 性能优化
    - 使用 React.memo 优化组件渲染
    - 使用 useMemo 缓存计算结果
    - 使用 useCallback 缓存回调函数
    - 实现图片懒加载
    - _Requirements: 所有需求_

  - [ ] 7.2 可访问性改进
    - 添加适当的 ARIA 属性
    - 确保键盘导航功能
    - 为图片添加有意义的 alt 文本
    - 检查颜色对比度
    - _Requirements: 所有需求_

  - [ ] 7.3 错误处理
    - 实现图片加载失败的占位符
    - 处理数据不可用的情况
    - 添加 GSR 值范围验证
    - 添加错误边界组件
    - _Requirements: 4.4_

  - [ ]* 7.4 编写集成测试
    - 测试 HomePage 与子组件的数据流
    - 测试路由导航功能
    - 测试用户交互（点击、导航）
    - _Requirements: 所有需求_

- [ ] 8. Final Checkpoint - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户
