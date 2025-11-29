# Implementation Plan

- [x] 1. Create utility functions and data constants






  - [x] 1.1 Create animal plaza data and configuration file

    - Create `src/config/animalPlazaConfig.ts` with ANIMALS array, MOOD_TEXTS array, and ANIMATION_CONFIG
    - Include at least 7 animals and 24 mood texts in Chinese
    - _Requirements: 1.3, 4.1, 4.2, 4.3_

  - [x] 1.2 Create utility functions for position and duration generation

    - Create `src/utils/animalPlazaUtils.ts` with generateRandomPosition, generateRandomDuration, getRandomMoodText, calculateDirection functions
    - _Requirements: 2.1, 2.3, 2.4, 3.2_
  - [ ]* 1.3 Write property tests for utility functions
    - **Property 1: Position bounds constraint**
    - **Property 2: Duration range constraint**
    - **Property 3: Direction calculation correctness**
    - **Property 4: Mood text validity**
    - **Validates: Requirements 2.1, 2.3, 2.4, 3.2, 4.3**

- [x] 2. Create SpeechBubble component






  - [x] 2.1 Implement SpeechBubble component with fade animation

    - Create `src/components/SpeechBubble.tsx` with rounded bubble design and tail
    - Implement fade-in/fade-out CSS animations
    - _Requirements: 3.4, 5.3_

  - [-] 2.2 Add SpeechBubble styles

    - Create CSS styles for bubble appearance, positioning, and animations
    - _Requirements: 5.3_


- [x] 3. Create Animal component with movement logic




  - [x] 3.1 Implement Animal component with state management


    - Create `src/components/Animal.tsx` with position, movement, and bubble state
    - Implement useEffect hooks for movement and bubble timing
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.3_
  - [x] 3.2 Implement movement animation and direction facing


    - Add CSS transition for smooth movement
    - Implement horizontal flip based on movement direction
    - Add shadow effect for grounded appearance
    - _Requirements: 2.2, 2.4, 5.2_
  - [ ]* 3.3 Write property test for movement-bubble mutual exclusion
    - **Property 5: Movement-bubble mutual exclusion**
    - **Validates: Requirements 3.5**

- [x] 4. Create AnimalPlaza main page component




  - [x] 4.1 Implement AnimalPlaza page component


    - Create `src/components/AnimalPlaza.tsx` as the main container
    - Render plaza background with pastel colors
    - Initialize and render all animals with random starting positions
    - _Requirements: 1.1, 1.2, 5.1_

  - [x] 4.2 Add AnimalPlaza styles

    - Create CSS for plaza background, layout, and responsive design
    - _Requirements: 5.1_

- [x] 5. Integrate AnimalPlaza into the application





  - [x] 5.1 Add route or navigation to AnimalPlaza page

    - Update App.tsx to include AnimalPlaza component or add routing
    - _Requirements: 1.1_

- [x] 6. Final Checkpoint




  - Ensure all tests pass, ask the user if questions arise.
