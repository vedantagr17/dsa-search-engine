# High-Performance Search Engine with MERN Stack

## Overview

This project is a high-performance search engine built using the MERN (MongoDB, Express.js, React, Node.js) stack. It scrapes and processes programming challenges from leading coding platforms to deliver a seamless and responsive user experience.

## Features

- **Data Collection**: Scrapes and processes a dataset of 3,500 programming problems from LeetCode, InterviewBit, and Codeforces using Selenium.
- **Edge Case Handling**: Includes robust techniques such as number-to-word conversion, lemmatization, spell-checking, and camel case conversion to handle diverse user query strings.
- **Search Algorithm Optimization**: Utilizes BM25 and TF-IDF indexes for efficient document ranking. Optimizes search speed with RAM-based indexes and efficient data structures.
- **Custom Scoring Metrics**: Implements custom scoring metrics for title matching and source reliability, ensuring accurate and trustworthy search results.

## Technology Stack

- **Frontend**: Embedded Javascript
- **Backend**: Node.js and Express.js
- **Web Scraping**: Selenium
- **Search Algorithms**: BM25 and TF-IDF

## Installation

1. **Clone the repository**:
    ```sh
    git clone https://github.com/yourusername/your-repo-name.git
    cd your-repo-name
    ```

2. **Install dependencies for both backend and frontend**:
    ```sh
    # Backend dependencies
    cd backend
    npm install
    
    # Frontend dependencies
    cd ../frontend
    npm install
    ```

3. **Set up environment variables**: Create a `.env` file in the backend directory with the following variables:
    ```env
    MONGODB_URI=your_mongodb_uri
    PORT=your_port
    ```

4. **Run the application**:
    ```sh
    # Backend
    cd backend
    npm start

    # Frontend
    cd ../frontend
    npm start
    ```

## Usage

- Access the frontend at `https://code-it-289o.onrender.com`.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Inspired by leading coding platforms like LeetCode, InterviewBit, and Codeforces.
- Special thanks to the open-source community for providing essential tools and libraries.

---

This README provides a comprehensive yet concise overview of your project, including its features, technology stack, installation instructions, and usage. Adjust the repository URL and any other specifics as needed.
