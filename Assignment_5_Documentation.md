# Assignment 5 Documentation

## 1. UI Design
The application features a modern, clean, and interactive user interface built with **React** and **Tailwind CSS**.
- **Color Palette & Theming:** Utilizes a custom color configuration with CSS variables supporting both light and dark modes. Key gradients include combinations of `strawberry`, `salmon`, and `peach`.
- **Typography:** Uses the 'Poppins' font family for a sleek and modern look.
- **Components:** Employs reusable UI components from `shadcn/ui` (e.g., Dialog, Input, Button, Accordion) to ensure a consistent design language.
- **Visual Effects:** Implements custom CSS classes like `.glass-effect` for frosted glass aesthetics and `.glow-effect` for subtle glowing shadows. Smooth transitions and hover effects (e.g., scaling, gradient backgrounds) enhance the user experience and interactivity seamlessly.

## 2. Form Validations
Forms throughout the application are designed with robust client-side validation to ensure data integrity before submission to the backend.
- **Required Fields:** All critical inputs (e.g., Job Role, Job Description, Years of Experience in `AddNewInterview.jsx`) implement the HTML5 `required` attribute.
- **Data Type Constraints:** Specific fields use strict types such as the "Years of Experience" field, which uses `type="number"` with a maximum boundary `max="50"`.
- **State Management:** React `useState` hooks manage form inputs, ensuring the UI stays in sync with user interactions and handles loading states seamlessly (preventing double submissions).
- **Submission Handling:** The `onSubmit` event handlers intercept default form reloads using `e.preventDefault()`, allowing data to be submitted asynchronously while displaying loading animations.

## 3. API Integration
The application seamlessly interacts with optimized backend APIs to handle data processing, AI interactions, and storage.
- **AI Integration:** Acts as an interface with Gemini AI models to dynamically generate custom interview questions and fetch realistic feedback for user answers. For instance, `POST /api/generate` and `POST /api/feedback/route.js` are called to construct targeted question-answer sets.
- **Database Operations:** Uses **Drizzle ORM** configured with PostgreSQL to manage the application's core data. Records such as `MockInterview` and `UserAnswer` are efficiently inserted via `db.insert().values()` and fetched dynamically based on user progress.
- **Error Handling & Parsing:** API routes use robust `try-catch` blocks and intelligently parse AI-returned markdown blocks (e.g., stripping ````json ```` backticks) into valid JSON formats to prevent logic crashes.

## 4. Responsive Design
The layout is fully responsive, ensuring a seamless and functional experience across desktop, tablet, and mobile displays.
- **Grid Systems:** Tailwind's responsive grid classes, such as `grid-cols-1 md:grid-cols-3` used in the components, guarantee that dashboard elements automatically stack vertically on small devices and expand elegantly on wider screens.
- **Flexible Container Dimensions:** Incorporates utility classes like `max-w-2xl` for dialog components alongside dynamic max heights. Padding (`p-4`, `p-8`) inside containers automatically adapts to avoid cramming text on smaller phones.
- **Dynamic Adaptability:** Content scales reasonably, scrollbars are smoothly modified (`::-webkit-scrollbar` via CSS), and larger blocks like AI-generated accordions compress visually without losing structural integrity or overlapping screen edges.
