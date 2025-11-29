# Requirements Document

## Introduction

本文档定义了主页面 UI 重构的需求。该功能将重新设计应用的主页面，展示一个可爱的角色形象、星星装饰以及情绪统计信息，创造更加友好和吸引人的用户体验。

## Glossary

- **Main Character**: 主页面顶部显示的角色图像（main.png）
- **Star Icon**: 位于角色下方的星星装饰图标（star.png）
- **Mood Statistics Card**: 显示今日情绪统计的卡片组件
- **Mood Summary Card**: 显示专属情绪总结的卡片组件
- **Home Page**: 应用的主界面页面
- **GSR Progress Bar**: 显示 GSR（皮肤电反应）数值的进度条

## Requirements

### Requirement 1

**User Story:** 作为用户，我希望在主页面看到一个友好的角色形象，这样我能感受到应用的亲和力和趣味性。

#### Acceptance Criteria

1. WHEN the Home Page loads THEN the system SHALL display the main character image from main.png at the top center of the page
2. WHEN the main character is displayed THEN the system SHALL ensure the image is properly sized and maintains its aspect ratio
3. WHEN the page is viewed on different screen sizes THEN the system SHALL scale the main character image appropriately

### Requirement 2

**User Story:** 作为用户，我希望在角色下方看到一个星星图标，这样页面看起来更加生动有趣。

#### Acceptance Criteria

1. WHEN the Home Page loads THEN the system SHALL display the star icon from star.png below the main character
2. WHEN the star icon is displayed THEN the system SHALL center it horizontally on the page
3. WHEN the star icon is displayed THEN the system SHALL position it with appropriate spacing from the main character

### Requirement 3

**User Story:** 作为用户，我希望看到 GSR 数值的进度条，这样我能直观了解当前的生理状态。

#### Acceptance Criteria

1. WHEN the Home Page loads THEN the system SHALL display a GSR progress bar between the star icon and the statistics cards
2. WHEN GSR data is available THEN the system SHALL show the current GSR value on the left side of the progress bar
3. WHEN GSR data is available THEN the system SHALL show the maximum GSR value on the right side of the progress bar
4. WHEN the GSR value changes THEN the system SHALL update the progress bar fill percentage accordingly

### Requirement 4

**User Story:** 作为用户，我希望在主页面下方看到今日情绪统计卡片，这样我能快速了解今天的情绪分布。

#### Acceptance Criteria

1. WHEN the Home Page loads THEN the system SHALL display a mood statistics card with the title "今日情绪统计"
2. WHEN mood data is available THEN the system SHALL display the count and distribution of different mood levels
3. WHEN mood data is available THEN the system SHALL show the total count of mood records
4. WHEN no mood data is available THEN the system SHALL display an appropriate empty state message

### Requirement 5

**User Story:** 作为用户，我希望在主页面下方看到专属情绪总结卡片，这样我能获得个性化的情绪分析。

#### Acceptance Criteria

1. WHEN the Home Page loads THEN the system SHALL display a mood summary card with the title "专属情绪总结"
2. WHEN the mood summary card is displayed THEN the system SHALL position it next to the mood statistics card
3. WHEN the mood summary card is displayed THEN the system SHALL maintain consistent styling with the statistics card

### Requirement 6

**User Story:** 作为用户，我希望主页面布局清晰美观，这样我能获得良好的视觉体验。

#### Acceptance Criteria

1. WHEN the Home Page is displayed THEN the system SHALL arrange all elements in a vertical layout with proper spacing
2. WHEN the statistics cards are displayed THEN the system SHALL arrange them horizontally in a row
3. WHEN the page is viewed on mobile devices THEN the system SHALL ensure all elements are responsive and properly sized
4. WHEN the page background is displayed THEN the system SHALL use a clean, light color scheme that complements the character and icons
