# Idea Flow Platform

A modern desktop application built with React and Electron for creating and managing flow diagrams and ideas visually.

## Features

- Interactive flow diagram creation and editing
- Desktop application with web technologies
- Modern React-based user interface
- Built with ReactFlow for powerful diagram capabilities

## Technologies Used

- React 18
- Electron
- ReactFlow
- Axios for API communication
- Jest for testing

## Prerequisites

Before running this application, make sure you have:

- Node.js (Latest LTS version recommended)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd idea-flow-platform
```

2. Install dependencies:
```bash
npm install
```

## Development

To run the application in development mode:

```bash
npm run electron-dev
```

This will:
- Start the React development server
- Launch the Electron application
- Enable hot-reloading for development

## Building

To create a production build:

```bash
npm run electron-build
```

This will create an optimized build and package it into a desktop application.

## Scripts

- `npm start` - Start React development server
- `npm run build` - Create production build
- `npm test` - Run tests
- `npm run electron-dev` - Run in development mode
- `npm run electron-build` - Create production build with Electron
- `npm run electron-pack` - Package the application

## Project Structure

```
idea-flow-platform/
├── public/           # Public assets
├── src/             # Source code
│   ├── components/  # React components
│   ├── utils/       # Utility functions
│   ├── App.js       # Main application component
│   └── index.js     # Application entry point
├── main.js          # Electron main process file
└── package.json     # Project dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div dir="rtl">

# منصة تدفق الأفكار

تطبيق سطح المكتب حديث تم بناؤه باستخدام React و Electron لإنشاء وإدارة مخططات التدفق والأفكار بشكل مرئي.

## المميزات

- إنشاء وتحرير مخططات التدفق بشكل تفاعلي
- تطبيق سطح المكتب مبني بتقنيات الويب
- واجهة مستخدم حديثة مبنية على React
- مدعوم بـ ReactFlow لقدرات رسم المخططات المتقدمة

## التقنيات المستخدمة

- React 18
- Electron
- ReactFlow
- Axios للتواصل مع واجهات البرمجة
- Jest للاختبارات

## المتطلبات الأساسية

قبل تشغيل التطبيق، تأكد من توفر:

- Node.js (يُنصح بأحدث إصدار LTS)
- npm (يأتي مع Node.js)

## التثبيت

1. استنساخ المستودع:
```bash
git clone [رابط-المستودع]
cd idea-flow-platform
```

2. تثبيت التبعيات:
```bash
npm install
```

## التطوير

لتشغيل التطبيق في وضع التطوير:

```bash
npm run electron-dev
```

هذا سوف:
- يشغل خادم التطوير الخاص بـ React
- يطلق تطبيق Electron
- يفعّل إعادة التحميل التلقائي للتطوير

## البناء

لإنشاء نسخة الإنتاج:

```bash
npm run electron-build
```

هذا سينشئ نسخة محسنة ويحزمها في تطبيق سطح المكتب.

## الأوامر البرمجية

- `npm start` - تشغيل خادم التطوير React
- `npm run build` - إنشاء نسخة الإنتاج
- `npm test` - تشغيل الاختبارات
- `npm run electron-dev` - التشغيل في وضع التطوير
- `npm run electron-build` - إنشاء نسخة الإنتاج مع Electron
- `npm run electron-pack` - حزم التطبيق

## هيكل المشروع

```
idea-flow-platform/
├── public/           # الملفات العامة
├── src/             # الكود المصدري
│   ├── components/  # مكونات React
│   ├── utils/       # الدوال المساعدة
│   ├── App.js       # المكون الرئيسي للتطبيق
│   └── index.js     # نقطة دخول التطبيق
├── main.js          # ملف العملية الرئيسية لـ Electron
└── package.json     # تبعيات المشروع والأوامر البرمجية
```

## المساهمة

1. انسخ المستودع (Fork)
2. أنشئ فرع الميزة الخاص بك (`git checkout -b feature/amazing-feature`)
3. قم بتثبيت تغييراتك (`git commit -m 'إضافة ميزة رائعة'`)
4. ادفع إلى الفرع (`git push origin feature/amazing-feature`)
5. افتح طلب سحب (Pull Request)

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف LICENSE للتفاصيل.

</div>
