import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { moodStorageService } from '../services/moodStorage';
import { MOOD_CONFIG } from '../config/moodConfig';
import type { TimeRange, TimeRangeStats, TrendDataPoint } from '../types';

/**
 * 详细分析页面组件
 * 显示情绪趋势图、周报、月报等深度分析
 * 
 * Requirements:
 * - 7.3: 显示返回按钮以便用户返回主界面
 * - 7.4: 点击返回按钮导航回主界面并保持之前的状态
 * - 9.1: 提供时间范围选择器（今日、本周、本月）
 * - 9.5: 切换时间范围时更新所有图表和统计数据
 * - 9.6: 在500毫秒内完成数据加载和渲染
 * - 7.2: 保持应用状态并正确加载历史数据
 * - 8.1: 使用折线图或面积图展示情绪状态随时间的变化
 * - 8.2: X轴显示时间，Y轴显示传感器值
 * - 8.3: 使用不同颜色区分不同情绪状态
 * - 8.4: 悬停显示详细信息
 * - 8.5: 空数据状态显示友好提示
 * - 8.6: 响应式布局并支持触摸交互
 * - 10.1: 显示每种情绪状态的总出现次数和占比
 * - 10.2: 显示每种情绪状态的总出现次数和占比
 * - 10.3: 使用饼图或柱状图可视化情绪分布
 * - 10.4: 计算并显示平均每日情绪变化次数
 * - 10.5: 标识出现最频繁的情绪状态
 * - 11.1: 使用与主界面一致的颜色主题和设计风格
 * - 11.2: 为每种情绪状态使用对应的配置颜色
 * - 11.3: 提供图例说明各颜色代表的情绪状态
 * - 11.4: 使用中文标签和说明文字
 * - 11.6: 确保所有图表和统计信息响应式显示
 */

export const MoodAnalyticsDetail: React.FC = () => {
  // Requirement 7.3, 7.4: 使用 useNavigate 实现返回功能
  const navigate = useNavigate();
  
  // Requirement 9.1: 时间范围状态管理
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  
  // Requirement 7.2, 9.5: 统计数据和趋势数据状态管理
  const [stats, setStats] = useState<TimeRangeStats | null>(null);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  
  // Requirement 9.6: 加载状态管理
  const [loading, setLoading] = useState(false);

  /**
   * 计算日期范围
   * Requirement 9.2, 9.3, 9.4: 根据时间范围类型计算开始和结束日期
   */
  const getDateRange = (range: TimeRange): { start: string; end: string } => {
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    
    let start: string;
    if (range === 'today') {
      start = end;
    } else if (range === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      start = weekAgo.toISOString().split('T')[0];
    } else { // month
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      start = monthAgo.toISOString().split('T')[0];
    }
    
    return { start, end };
  };

  /**
   * 加载数据
   * Requirement 7.2: 正确加载历史数据
   * Requirement 9.5: 时间范围变化时加载数据
   * Requirement 9.6: 在500ms内完成加载
   */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // 使用 setTimeout 确保加载状态可见（即使数据加载很快）
      const startTime = Date.now();
      
      const { start, end } = getDateRange(timeRange);
      const records = moodStorageService.getRecordsByRange(start, end);
      
      // 计算统计
      const calculatedStats = moodStorageService.calculateTimeRangeStats(timeRange, records);
      setStats(calculatedStats);
      
      // 获取趋势数据
      const trend = moodStorageService.getTrendData(records);
      setTrendData(trend);
      
      // 确保最小加载时间，避免闪烁
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 100) {
        await new Promise(resolve => setTimeout(resolve, 100 - elapsedTime));
      }
      
      setLoading(false);
    };

    loadData();
  }, [timeRange]);

  /**
   * 返回按钮处理
   * Requirement 7.4: 导航回主界面并保持之前的状态
   */
  const handleBack = () => {
    navigate('/');
  };

  /**
   * 时间范围切换处理
   * Requirement 9.5: 切换时间范围时更新所有图表和统计数据
   */
  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
  };

  // Requirement 9.6: 加载状态显示
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    // Requirement 11.1: 使用与主界面一致的颜色主题和设计风格
    // Requirement 11.6: 响应式布局
    // Requirement 8.6: 移动端优化 - 添加触摸友好的间距和尺寸
    // Requirement 11.1, 11.4: 可访问性 - 主要内容区域标记
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 pb-safe"
      role="main"
      aria-label="情绪数据详细分析页面"
    >
      {/* 头部 */}
      <header className="max-w-6xl mx-auto mb-4 md:mb-6">
        {/* Requirement 7.3: 返回按钮 */}
        {/* Requirement 8.6: 移动端优化 - 增大触摸目标尺寸 */}
        {/* Requirement 11.1, 11.4: 可访问性 - ARIA标签和键盘导航 */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 active:text-slate-900 transition-colors mb-3 md:mb-4 px-4 py-2.5 rounded-lg hover:bg-white/50 active:bg-white/70 touch-manipulation focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="返回主页"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span className="font-medium text-sm sm:text-base">返回主页</span>
        </button>
        
        {/* Requirement 11.4: 使用中文标签 */}
        {/* Requirement 8.6: 移动端优化 - 响应式字体大小 */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800">
          情绪数据分析
        </h1>
      </header>

      {/* Requirement 9.1: 时间范围选择器 */}
      {/* Requirement 8.6: 移动端优化 - 响应式间距和触摸友好按钮 */}
      {/* Requirement 11.1, 11.4: 可访问性 - 语义化导航和ARIA标签 */}
      <nav className="max-w-6xl mx-auto mb-4 md:mb-6" aria-label="时间范围选择">
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200">
          <div className="flex gap-2 flex-wrap" role="group" aria-label="选择查看的时间范围">
            {(['today', 'week', 'month'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => handleTimeRangeChange(range)}
                className={`flex-1 min-w-[80px] px-4 py-2.5 rounded-lg font-medium transition-all touch-manipulation text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  timeRange === range
                    ? 'bg-indigo-500 text-white shadow-md active:bg-indigo-600'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300'
                }`}
                aria-pressed={timeRange === range}
                aria-label={`查看${range === 'today' ? '今日' : range === 'week' ? '本周' : '本月'}数据`}
              >
                {/* Requirement 11.4: 使用中文标签 */}
                {range === 'today' ? '今日' : range === 'week' ? '本周' : '本月'}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Requirement 8.5: 空状态显示 */}
      {/* Requirement 8.6: 移动端优化 - 响应式间距 */}
      {/* Requirement 11.1, 11.4: 可访问性 - 语义化区域和ARIA标签 */}
      {!stats || stats.totalRecords === 0 ? (
        <section className="max-w-6xl mx-auto" aria-label="空数据状态">
          <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 sm:p-8 text-center shadow-sm border border-slate-200">
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4" aria-hidden="true">📊</div>
            <p className="text-base sm:text-lg text-slate-600 mb-2">该时间范围内暂无数据</p>
            <p className="text-xs sm:text-sm text-slate-500">开始使用GSR传感器记录您的情绪状态</p>
          </div>
        </section>
      ) : (
        <>
          {/* Requirement 10.4, 10.5: 概览卡片 */}
          {/* Requirement 8.6: 移动端优化 - 响应式网格布局 */}
          {/* Requirement 11.1, 11.4: 可访问性 - 语义化区域 */}
          <section 
            className="max-w-6xl mx-auto mb-4 md:mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4"
            aria-label="数据概览"
          >
            {/* 总记录数 */}
            {/* Requirement 8.6: 移动端优化 - 响应式内边距和字体大小 */}
            {/* Requirement 11.1, 11.4: 可访问性 - ARIA标签 */}
            <div 
              className="bg-white/80 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200"
              role="article"
              aria-label={`总记录数：${stats.totalRecords}次情绪变化`}
            >
              <p className="text-xs sm:text-sm text-slate-500 mb-1 sm:mb-2">总记录数</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-800">{stats.totalRecords}</p>
              <p className="text-xs text-slate-400 mt-1">次情绪变化</p>
            </div>
            
            {/* Requirement 10.4: 平均每日变化次数 */}
            {/* Requirement 8.6: 移动端优化 - 响应式内边距和字体大小 */}
            {/* Requirement 11.1, 11.4: 可访问性 - ARIA标签 */}
            <div 
              className="bg-white/80 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200"
              role="article"
              aria-label={`平均每日变化：${stats.avgDailyChanges.toFixed(1)}次每天`}
            >
              <p className="text-xs sm:text-sm text-slate-500 mb-1 sm:mb-2">平均每日变化</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-800">
                {stats.avgDailyChanges.toFixed(1)}
              </p>
              <p className="text-xs text-slate-400 mt-1">次/天</p>
            </div>
            
            {/* Requirement 10.5: 最频繁情绪 */}
            {/* Requirement 8.6: 移动端优化 - 响应式内边距和字体大小 */}
            {/* Requirement 11.1, 11.4: 可访问性 - ARIA标签 */}
            <div 
              className="bg-white/80 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200"
              role="article"
              aria-label={stats.mostFrequentMood ? `最频繁情绪：${MOOD_CONFIG[stats.mostFrequentMood].label}，出现${stats.allMoods[0].count}次，占比${stats.allMoods[0].percentage.toFixed(1)}%` : '最频繁情绪：暂无数据'}
            >
              <p className="text-xs sm:text-sm text-slate-500 mb-1 sm:mb-2">最频繁情绪</p>
              {stats.mostFrequentMood ? (
                <>
                  {/* Requirement 11.2: 使用对应的配置颜色 */}
                  <p 
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ color: MOOD_CONFIG[stats.mostFrequentMood].chartColor }}
                  >
                    {/* Requirement 11.4: 使用中文标签 */}
                    {MOOD_CONFIG[stats.mostFrequentMood].label}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {stats.allMoods[0].count}次 ({stats.allMoods[0].percentage.toFixed(1)}%)
                  </p>
                </>
              ) : (
                <p className="text-2xl sm:text-3xl font-bold text-slate-400">-</p>
              )}
            </div>
          </section>

          {/* Requirement 8.1, 8.2, 8.3, 8.4, 8.6: 趋势图 */}
          {/* Requirement 8.6: 移动端优化 - 响应式间距和图表高度 */}
          {/* Requirement 11.1, 11.4: 可访问性 - 语义化区域和图表说明 */}
          <section 
            className="max-w-6xl mx-auto mb-4 md:mb-6"
            aria-labelledby="trend-chart-heading"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
              <h2 
                id="trend-chart-heading"
                className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4"
              >
                情绪趋势图
              </h2>
              
              {trendData.length === 0 ? (
                // Requirement 8.5: 空数据状态
                <div 
                  className="h-48 sm:h-64 flex items-center justify-center text-slate-400"
                  role="status"
                  aria-label="暂无趋势数据"
                >
                  <p className="text-sm sm:text-base">暂无趋势数据</p>
                </div>
              ) : (
                // Requirement 8.6: 响应式布局 - 移动端优化图表高度
                // Requirement 11.1, 11.4: 可访问性 - 图表区域和文字说明
                <>
                  <div className="sr-only" role="img" aria-label={`情绪趋势图表，显示${trendData.length}个数据点，传感器值范围从${Math.min(...trendData.map(d => d.sensorValue)).toFixed(1)}到${Math.max(...trendData.map(d => d.sensorValue)).toFixed(1)}`}>
                    情绪趋势图：展示了选定时间范围内的情绪变化趋势，X轴为时间，Y轴为传感器数值。
                  </div>
                  <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 250 : 300}>
                  {/* Requirement 8.1: 使用面积图展示情绪状态随时间的变化 */}
                  <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    {/* Requirement 8.2: X轴显示时间 */}
                    {/* Requirement 8.6: 移动端优化 - 减少X轴标签数量和字体大小 */}
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: window.innerWidth < 640 ? 9 : 11, fill: '#64748b' }}
                      angle={-45}
                      textAnchor="end"
                      height={window.innerWidth < 640 ? 70 : 80}
                      interval={window.innerWidth < 640 ? 'preserveStartEnd' : 'preserveEnd'}
                    />
                    {/* Requirement 8.2: Y轴显示传感器值 */}
                    {/* Requirement 8.6: 移动端优化 - 调整Y轴标签 */}
                    <YAxis 
                      label={{ 
                        value: '传感器值', 
                        angle: -90, 
                        position: 'insideLeft', 
                        style: { fill: '#64748b', fontSize: window.innerWidth < 640 ? 10 : 12 } 
                      }}
                      tick={{ fontSize: window.innerWidth < 640 ? 9 : 11, fill: '#64748b' }}
                      width={window.innerWidth < 640 ? 35 : 45}
                    />
                    {/* Requirement 8.4: 悬停显示详细信息 */}
                    {/* Requirement 8.6: 移动端优化 - 触摸友好的Tooltip */}
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as TrendDataPoint;
                          return (
                            <div className="bg-white p-2 sm:p-3 rounded-lg shadow-lg border border-slate-200">
                              {/* Requirement 11.4: 使用中文标签 */}
                              <p className="text-xs sm:text-sm font-semibold text-slate-800">{data.label}</p>
                              <p className="text-xs text-slate-600">{data.time}</p>
                              <p className="text-xs text-slate-600">传感器值: {data.sensorValue.toFixed(1)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {/* Requirement 8.3: 使用不同颜色（通过渐变） */}
                    <Area 
                      type="monotone" 
                      dataKey="sensorValue" 
                      stroke="#6366f1" 
                      fill="#818cf8" 
                      fillOpacity={0.6}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                </>
              )}
            </div>
          </section>

          {/* Requirement 10.1, 10.2, 10.3, 11.1, 11.2, 11.3, 11.4: 情绪分布 */}
          {/* Requirement 8.6: 移动端优化 - 响应式间距和布局 */}
          {/* Requirement 11.1, 11.4: 可访问性 - 语义化区域 */}
          <section 
            className="max-w-6xl mx-auto mb-4 md:mb-6"
            aria-labelledby="mood-distribution-heading"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
              <h2 
                id="mood-distribution-heading"
                className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4"
              >
                {/* Requirement 11.4: 使用中文标签 */}
                {timeRange === 'today' ? '今日' : timeRange === 'week' ? '本周' : '本月'}情绪分布
              </h2>
              
              {/* Requirement 8.6: 移动端优化 - 垂直堆叠布局在小屏幕上 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Requirement 10.3: 使用饼图可视化情绪分布 */}
                {/* Requirement 11.6: 响应式布局 */}
                {/* Requirement 8.6: 移动端优化 - 调整图表大小和标签 */}
                {/* Requirement 11.1, 11.4: 可访问性 - 图表文字说明 */}
                <div>
                  <div className="sr-only" role="img" aria-label={`情绪分布饼图，共${stats.allMoods.length}种情绪状态。${stats.allMoods.map(m => `${MOOD_CONFIG[m.moodType].label}占比${m.percentage.toFixed(1)}%`).join('，')}`}>
                    情绪分布饼图：展示了各种情绪状态的占比分布。
                  </div>
                  <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 250 : 300}>
                  <PieChart>
                    <Pie
                      data={stats.allMoods as any}
                      dataKey="count"
                      nameKey="moodType"
                      cx="50%"
                      cy="50%"
                      outerRadius={window.innerWidth < 640 ? 70 : 80}
                      label={(entry: any) => {
                        // Requirement 8.6: 移动端优化 - 简化标签在小屏幕上
                        const moodType = entry.moodType || entry.name;
                        const label = MOOD_CONFIG[moodType as keyof typeof MOOD_CONFIG]?.label || '';
                        return window.innerWidth < 640 ? label.slice(0, 2) : label;
                      }}
                      labelLine={window.innerWidth >= 640}
                    >
                      {/* Requirement 11.2: 为每种情绪状态使用对应的配置颜色 */}
                      {stats.allMoods.map((entry) => (
                        <Cell 
                          key={entry.moodType} 
                          fill={MOOD_CONFIG[entry.moodType].chartColor} 
                        />
                      ))}
                    </Pie>
                    {/* Requirement 8.4: 悬停显示详细信息 */}
                    {/* Requirement 8.6: 移动端优化 - 触摸友好的Tooltip */}
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          const moodType = data.name as string;
                          return (
                            <div className="bg-white p-2 sm:p-3 rounded-lg shadow-lg border border-slate-200">
                              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                                {MOOD_CONFIG[moodType as keyof typeof MOOD_CONFIG].label}
                              </p>
                              <p className="text-xs text-slate-600">
                                {data.value}次 ({((data.value as number) / stats.totalRecords * 100).toFixed(1)}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                </div>

                {/* Requirement 10.1, 10.2: 统计列表显示详细数据 */}
                {/* Requirement 8.6: 移动端优化 - 响应式间距 */}
                {/* Requirement 11.1, 11.4: 可访问性 - 语义化列表 */}
                <div 
                  className="space-y-2 sm:space-y-3"
                  role="list"
                  aria-label="情绪统计详细列表"
                >
                  {stats.allMoods.map((stat) => {
                    const config = MOOD_CONFIG[stat.moodType];
                    return (
                      <div 
                        key={stat.moodType} 
                        className="flex items-center gap-2 sm:gap-3"
                        role="listitem"
                        aria-label={`${config.label}：出现${stat.count}次，占比${stat.percentage.toFixed(1)}%`}
                      >
                        {/* Requirement 11.2: 使用对应的配置颜色 */}
                        {/* Requirement 11.3: 提供图例说明 */}
                        {/* Requirement 11.1, 11.4: 可访问性 - 颜色指示器说明 */}
                        <div 
                          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: config.chartColor }}
                          role="img"
                          aria-label={`${config.label}颜色指示器`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            {/* Requirement 11.4: 使用中文标签 */}
                            <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">
                              {config.label}
                            </span>
                            {/* Requirement 10.1, 10.2: 显示次数和占比 */}
                            <span className="text-xs sm:text-sm text-slate-600 flex-shrink-0 ml-2">
                              {stat.count}次 ({stat.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          {/* 进度条 */}
                          {/* Requirement 11.1, 11.4: 可访问性 - 进度条ARIA属性 */}
                          <div 
                            className="w-full h-1.5 sm:h-2 bg-slate-200 rounded-full overflow-hidden"
                            role="progressbar"
                            aria-valuenow={stat.percentage}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${config.label}占比${stat.percentage.toFixed(1)}%`}
                          >
                            <div
                              className="h-full transition-all duration-500"
                              style={{
                                width: `${stat.percentage}%`,
                                backgroundColor: config.chartColor
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
