# Electronic Health Record (EHR) System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

A comprehensive Electronic Health Record system developed by Sanskritee Shilpa Pandey for academic purposes. This application aims to simulate real-world EHR functionality while adhering to the project requirements for educational assessment.

## 📋 Features

- Secure patient data management
- Medical history tracking
- Appointment scheduling
- Prescription management
- User role-based access control
- Interactive dashboard for healthcare providers

## 🗂️ Project Structure

```
EHR-system/
├── frontend/          # React-based UI components and pages
├── middlewares/       # Authentication and authorization logic
├── routes/            # API endpoints and business logic
└── models/            # Data models and schema definitions
```

## 🔧 Technologies Used

- **Frontend**: React.js, Vite, Tailwind
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT

## 🚀 Getting Started

### Prerequisites

- Node.js (v14.x or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository

```bash
git clone https://github.com/Octa470/EHR-system.git
```

2. Navigate to the project directory

```bash
cd EHR-system
```

3. Install server dependencies

```bash
npm install
# or
yarn install
```

4. Install frontend dependencies

```bash
cd frontend
npm install --legacy-peer-deps
# or
yarn install --legacy-peer-deps
```

5. Return to the root directory

```bash
cd ..
```

6. Start the development servers

```bash
npm run dev
```

The application should now be running at `http://localhost:3000`

## 🔒 Environment Configuration

Create a `.env` file in the root directory and add the following variables:

```
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=cloudinary_cloud_name
CLOUDINARY_API_KEY=cloudinary_api_key
CLOUDINARY_API_SECRET=cloudinary_api_secret
```

## 📝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 📞 Contact

For any questions or suggestions, please contact:

Shrey Yash Verma - shreyyashv@gmail.com

---