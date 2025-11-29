# 响应式断点指南

## Tailwind CSS 断点

```
┌─────────────────────────────────────────────────────────────────┐
│                        屏幕尺寸范围                              │
├─────────────────────────────────────────────────────────────────┤
│  < 640px     │  640px - 768px  │  768px - 1024px │  > 1024px   │
│   移动端      │    小屏幕       │    中等屏幕      │   大屏幕     │
│              │      (sm:)      │      (md:)      │    (lg:)    │
└─────────────────────────────────────────────────────────────────┘
```

## 组件响应式行为

### 1. 页面容器内边距
```
移动端 (< 640px):     p-3      (12px)
小屏幕 (640px+):      sm:p-4   (16px)
桌面端 (768px+):      md:p-6   (24px)
```

### 2. 标题字体大小
```
移动端 (< 640px):     text-xl       (20px)
小屏幕 (640px+):      sm:text-2xl   (24px)
桌面端 (768px+):      md:text-3xl   (30px)
```

### 3. 概览卡片布局
```
移动端 (< 640px):     grid-cols-1        (垂直堆叠)
小屏幕 (640px+):      sm:grid-cols-3     (3列网格)
```

### 4. 情绪分布布局
```
移动端 (< 1024px):    grid-cols-1        (垂直堆叠)
大屏幕 (1024px+):     lg:grid-cols-2     (2列网格)
```

### 5. 按钮字体大小
```
移动端 (< 640px):     text-sm      (14px)
小屏幕 (640px+):      sm:text-base (16px)
```

### 6. 卡片内边距
```
移动端 (< 640px):     p-4      (16px)
小屏幕 (640px+):      sm:p-6   (24px)
```

### 7. 统计数字字体
```
移动端 (< 640px):     text-2xl     (24px)
小屏幕 (640px+):      sm:text-3xl  (30px)
```

### 8. 图表高度
```
移动端 (< 640px):     250px
桌面端 (640px+):      300px
```

### 9. 饼图半径
```
移动端 (< 640px):     70px
桌面端 (640px+):      80px
```

### 10. 图表字体大小
```
移动端 (< 640px):     9px
桌面端 (640px+):      11px
```

## MoodAnalytics 组件

### 徽章大小
```
移动端 (< 640px):     w-6 h-6      (24x24px)
小屏幕 (640px+):      sm:w-7 sm:h-7 (28x28px)
```

### 进度条高度
```
移动端 (< 640px):     h-1.5    (6px)
小屏幕 (640px+):      sm:h-2   (8px)
```

### 情绪标签字体
```
移动端 (< 640px):     text-xs      (12px)
小屏幕 (640px+):      sm:text-sm   (14px)
```

### 统计文本字体
```
移动端 (< 640px):     text-[10px]  (10px)
小屏幕 (640px+):      sm:text-xs   (12px)
```

## 间距系统

### 组件间距 (gap)
```
移动端 (< 640px):     gap-2        (8px)
小屏幕 (640px+):      sm:gap-3     (12px)
桌面端 (768px+):      md:gap-4     (16px)
大屏幕 (1024px+):     lg:gap-6     (24px)
```

### 底部边距 (mb)
```
移动端 (< 640px):     mb-3         (12px)
小屏幕 (640px+):      sm:mb-4      (16px)
桌面端 (768px+):      md:mb-6      (24px)
```

## 触摸目标尺寸

### 最小触摸目标
```
所有交互元素:         44x44px (WCAG 标准)
按钮垂直内边距:       py-2.5 (10px)
按钮最小宽度:         min-w-[80px]
```

### 触摸优化类
```
touch-manipulation    - 优化触摸响应
active:bg-*          - 触摸反馈
active:text-*        - 触摸反馈
```

## 文本处理

### 防止溢出
```
truncate             - 截断文本并显示省略号
min-w-0              - 允许 flex 项目收缩到 0
overflow-hidden      - 隐藏溢出内容
```

### 响应式字体大小
```
text-[10px]          - 自定义 10px (移动端最小)
text-xs              - 12px
text-sm              - 14px
text-base            - 16px
text-lg              - 18px
text-xl              - 20px
text-2xl             - 24px
text-3xl             - 30px
```

## 图表响应式配置

### AreaChart (趋势图)
```javascript
// 高度
height={window.innerWidth < 640 ? 250 : 300}

// 边距
margin={{ top: 5, right: 5, left: -20, bottom: 5 }}

// X轴
tick={{ fontSize: window.innerWidth < 640 ? 9 : 11 }}
height={window.innerWidth < 640 ? 70 : 80}
interval={window.innerWidth < 640 ? 'preserveStartEnd' : 'preserveEnd'}

// Y轴
tick={{ fontSize: window.innerWidth < 640 ? 9 : 11 }}
width={window.innerWidth < 640 ? 35 : 45}
label={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
```

### PieChart (饼图)
```javascript
// 高度
height={window.innerWidth < 640 ? 250 : 300}

// 半径
outerRadius={window.innerWidth < 640 ? 70 : 80}

// 标签
label={(entry) => {
  const label = MOOD_CONFIG[entry.moodType].label;
  return window.innerWidth < 640 ? label.slice(0, 2) : label;
}}

// 标签线
labelLine={window.innerWidth >= 640}
```

## 测试断点

### Chrome DevTools
1. 打开开发者工具 (F12)
2. 切换到设备模拟模式 (Ctrl+Shift+M)
3. 选择设备或自定义尺寸

### 推荐测试尺寸
```
375px  - iPhone SE (移动端)
390px  - iPhone 12 Pro (移动端)
428px  - iPhone 12 Pro Max (大屏手机)
640px  - 小屏幕断点
768px  - iPad Mini (平板/中等屏幕断点)
1024px - 大屏幕断点
1366px - 笔记本
1920px - 桌面显示器
```

## 性能考虑

### 移动端优化
- 减少图表标签数量
- 使用较小的图表尺寸
- 简化标签文本
- 优化边距以最大化内容区域

### 桌面端增强
- 显示完整标签
- 使用较大的图表尺寸
- 显示更多细节
- 使用更宽松的间距

## 可访问性

### WCAG 标准
- 最小触摸目标: 44x44px ✅
- 最小字体大小: 10px (移动端) ✅
- 颜色对比度: 4.5:1 (正文) ✅
- 颜色对比度: 3:1 (大文本) ✅

### 触摸友好
- 所有按钮 py-2.5 或更大 ✅
- 所有交互元素有 active 状态 ✅
- 使用 touch-manipulation ✅
- 无意外的双击缩放 ✅

## 最佳实践

### 1. 移动优先
```tsx
// ✅ 好的做法
className="text-xs sm:text-sm md:text-base"

// ❌ 避免
className="text-base md:text-xs"
```

### 2. 渐进增强
```tsx
// ✅ 好的做法
className="p-3 sm:p-4 md:p-6"

// ❌ 避免
className="p-6 md:p-3"
```

### 3. 一致的断点
```tsx
// ✅ 好的做法 - 使用相同的断点
className="text-xs sm:text-sm"
className="p-3 sm:p-4"

// ❌ 避免 - 混合不同的断点
className="text-xs md:text-sm"
className="p-3 sm:p-4"
```

### 4. 语义化的尺寸
```tsx
// ✅ 好的做法
className="w-6 h-6 sm:w-7 sm:h-7"

// ❌ 避免
className="w-[24px] h-[24px] sm:w-[28px] sm:h-[28px]"
```

## 调试技巧

### 1. 查看当前断点
```javascript
// 在浏览器控制台
console.log('Width:', window.innerWidth);
console.log('Breakpoint:', 
  window.innerWidth < 640 ? 'mobile' :
  window.innerWidth < 768 ? 'sm' :
  window.innerWidth < 1024 ? 'md' : 'lg'
);
```

### 2. 测试响应式
```javascript
// 监听窗口大小变化
window.addEventListener('resize', () => {
  console.log('New width:', window.innerWidth);
});
```

### 3. 检查元素尺寸
```javascript
// 在浏览器控制台
const element = document.querySelector('.your-element');
console.log('Size:', element.getBoundingClientRect());
```

## 总结

这个响应式系统确保了：
- ✅ 所有设备上的一致体验
- ✅ 触摸友好的交互
- ✅ 优化的性能
- ✅ 可访问性标准
- ✅ 易于维护的代码
