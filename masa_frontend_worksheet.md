# מודול 6: פיתוח Frontend — משימת כיתה (אפליקציית MASA)

**האפליקציה שלי:** MASA (אתר דאשבורד אינטראקטיבי לניהול ותיעוד טיולים)

---

## 🧩 חלק 1: פירוק לרכיבים (Component Breakdown)

חילקנו את ממשק המשתמש של MASA לרכיבים עצמאיים לפי סוגים:
* **Shared (משותף):** רכיב המוצג במספר עמודים/מסכים ושומר על מבנה זהה.
* **Section (אזור):** רכיב עצמאי גדול המייצג אזור או מסך שלם באפליקציה.
* **Reusable (שימושי חוזר):** רכיב קטן יותר ודינמי שניתן להשתמש בו מספר פעמים עם נתונים שונים.

### עמוד ראשון: Landing page (מסך כניסה - AuthScreen)

| שם הרכיב (Component) | סוג | באילו עמודים מופיע | תיאור קצר |
| :--- | :--- | :--- | :--- |
| **AuthScreen** | Section | Auth / Landing | מסך כניסה שיווקי הכולל את כותרת המותג MASA, הסבר קצר על המערכת וכפתור כניסה מאובטח עם Google. |
| **MasaLogo** | Reusable | כולם | סמל הלוגו הגיאומטרי והאינטראקטיבי של MASA (מצפן, מחוג ופסגות הרים) עם אנימציה קלה. |
| **BackgroundOrbs** | Shared | כולם | אלמנטים עיצוביים ברקע (ענני צבע צבעוניים ומטושטשים ב-CSS) המעניקים עומק ויזואלי למצב הכהה. |
| **TopNavbar** | Shared | כולם (למעט Auth) | סרגל הניווט העליון המשותף המכיל את כרטיסיות הניווט, הלוגו והפרופיל האישי. |

---

### עמוד שני: Dashboard (מסך מפה - MapScreen)

| שם הרכיב (Component) | סוג | באילו עמודים מופיע | תיאור קצר |
| :--- | :--- | :--- | :--- |
| **MapScreen** | Section | Map / Dashboard | מסך המפה האינטראקטיבי המרכזי המרנדר את מפות Leaflet הכהות וסיכות המשתמש. |
| **MapFloatingBar** | Section | Map / Dashboard | סרגל הכלים הצף בתחתית המפה המאפשר העלאת תמונה וחילוץ מטא-דאטה. |
| **PhotoMapMarker** | Reusable | Map / Dashboard | סיכות המפה המעוצבות כעיגולים המכילים את תמונת הטיול הממוזערת של המשתמש וגבול סגול. |
| **PopupCard** | Reusable | Map / Dashboard | בועת המידע הנפתחת מעל סיכה ומציגה תמונה, תאריך וכפתור ניווט ליומן המסע. |

---

### עמוד שלישי: Assets list (מסך תקציב - BudgetScreen)

| שם הרכיב (Component) | סוג | באילו עמודים מופיע | תיאור קצר |
| :--- | :--- | :--- | :--- |
| **BudgetScreen** | Section | Budget | מסך ניהול התקציב הכללי של הטיול המציג את יתרת התקציב ורשימת ההוצאות. |
| **BudgetDonutChart** | Section | Budget | תרשים עוגה (דונאט) מעוצב SVG המציג את אחוזי פילוח ההוצאות לפי קטגוריות הטיול. |
| **ExpenseList** | Section | Budget | רשימה כרונולוגית המרכזת את כל ההוצאות שהוזנו על ידי המשתמש. |
| **ExpenseItem** | Reusable | Budget | שורת הוצאה בודדת המציגה את כותרת ההוצאה, תאריך, סכום בשקלים וכפתור מחיקה. |
| **ActionButton** | Reusable | כולם | כפתור סגול סולידי בעל עיצוב אחיד המשמש להוספת פריטים חדשים בכל המסכים. |

---

### עמוד רביעי: Goals page (יומן ורשימות - Timeline & Checklist)

| שם הרכיב (Component) | סוג | באילו עמודים מופיע | תיאור קצר |
| :--- | :--- | :--- | :--- |
| **TimelineScreen** | Section | Timeline | מסך יומן המסע המציג פיד כרונולוגי של החוויות של המשתמש. |
| **TimelineCard** | Reusable | Timeline | כרטיסיית חוויה ביומן המסע המציגה תאריך, מיקום, תמונת חוויה, הערה כתובה וכפתורי עריכה ומחיקה. |
| **ChecklistScreen** | Section | Checklist | מסך רשימות התכנון המציג את המשימות והיעדים לטיול. |
| **ChecklistColumn** | Reusable | Checklist | כרטיסיית רשימה גדולה (עבור ציוד אריזה או יעדי ביקור) הכוללת כותרת, מד אחוזי ביצוע ורשימת פריטים. |
| **ChecklistItem** | Reusable | Checklist | שורת משימה בודדת המורכבת מתיבת סימון (checkbox) עגולה, כיתוב המשימה וכפתור מחיקה מהיר. |
| **SettingsScreen** | Section | Settings / Profile | מסך עריכת פרטי משתמש, הגדרת תקציב טיול מקסימלי ובחירת סגנון המפה (נפתח דרך לחיצה על האוואטר). |

---

## 🗺️ חלק 2: מפת ניווט (Routing)

באפליקציית **MASA** (שהיא אפליקציית עמוד יחיד - SPA), הניווט מנוהל באמצעות מצב פנימי (`state`) המדמה מפת דרכים מלאה המפרידה בין תפקידי הדפים:

| תיאור קצר | שם העמוד (Page Component) | conceptual URL |
| :--- | :--- | :--- |
| עמוד כניסה והזדהות מאובטח (Google OAuth2 / Simulation) | `AuthScreen` | `/` |
| מפת העולם האינטראקטיבית ולוח ההעלאות | `MapScreen` | `/map` |
| לוח מעקב יתרת תקציב ודיאגרמת הוצאות | `BudgetScreen` | `/budget` |
| פיד יומן המסע הכרונולוגי והתמונות | `TimelineScreen` | `/timeline` |
| לוח רשימות הכנת הציוד ומקומות לביקור | `ChecklistScreen` | `/checklist` |
| ממשק הגדרות פרופיל, שינוי תקציב ועיצוב המפה | `SettingsScreen` | `/settings` |

---

## 📦 חלק 3: תוצרים (Deliverables)

### קישור ל-GitHub Repository:
🔗 [https://github.com/guybd13-svg/MASA](https://github.com/guybd13-svg/MASA)

### מבנה תיקיות הפרויקט האמיתי (Folder Structure):
הפרויקט מבוסס על React + TypeScript + Vite וסנכרון מול Supabase:

```
/travel-app
├── DESIGN.md                 # אפיון מערכת העיצוב (צבעים, פונטים, רכיבים)
├── index.html                # עמוד הכניסה של הדפדפן
├── package.json              # הגדרת ספריות ותלויות (Leaflet, Supabase)
├── tsconfig.json             # הגדרות קומפילציית TypeScript
├── vite.config.ts            # קובץ הגדרות השרת המקומי של Vite
└── /src                      # קוד המקור של האפליקציה
    ├── main.tsx              # נקודת הכניסה לאפליקציית ה-React
    ├── App.tsx               # רכיב הליבה המנהל את הסטייט והניווט
    ├── index.css             # קובץ הסטייל הראשי המכיל את משתני ה-CSS
    ├── App.css               # סטייל משלים עבור הילדות ועימודים
    ├── /components           # רכיבי ה-React השונים
    │   ├── AuthScreen.tsx
    │   ├── MapScreen.tsx
    │   ├── BudgetScreen.tsx
    │   ├── TimelineScreen.tsx
    │   ├── ChecklistScreen.tsx
    │   ├── SettingsScreen.tsx
    │   └── MasaLogo.tsx
    └── /utils                # קובצי עזר לתקשורת ועיבוד
        ├── supabaseClient.ts # אתחול וחיבור לענן של Supabase
        └── exifUtils.ts      # עיבוד תמונות, חילוץ מיקום ופענוח גיאוגרפי
```
