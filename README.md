# Telegram News Bot

Welcome to the Telegram News Bot! This bot is designed to fetch news from various sources and deliver them to specific private Telegram channels. It is built using Node.js with Prisma as the ORM, allowing seamless interaction with the Telegram API and a relational database.

## Features

- **News Aggregation:** The bot aggregates news from different news websites.
- **Multichannel Broadcasting:** Each news source has its private Telegram channel for broadcasting.

## Technologies Used

- **Node.js**
- **Prisma (ORM)**
- **Telegram API**

## Setup

### Prerequisites

- Node.js installed on your system.
- A Telegram bot created via [@BotFather](https://core.telegram.org/bots#botfather).
- Prisma configured with a database URL.
- Developer ID for administrative purposes.

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Dmitry-Kang/news-telegram-scrapper.git
cd telegram-news-bot
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the following configuration:

```env
TELEGRAM_TOKEN=your_telegram_token
DATABASE_URL=your_database_url
DEVELOPER_ID=your_developer_id
```

### Database Setup

1. Run database migrations:

```bash
npx prisma migrate dev
```

2. Seed initial data (if needed):

```bash
npx prisma db seed --preview-feature
```

### Usage

1. Start the bot:

```bash
npm start
```

2. The bot will periodically fetch news from different sources and broadcast them to their respective private Telegram channels.

## Bot Commands

- `/start`: Begin interacting with the bot.
- `/help`: Display the list of available commands.
- (Admin Command) `/send_news`: Manually trigger the news fetching and broadcasting process.

## Channels

Each news source corresponds to a private Telegram channel. You can configure these channels in the Prisma database.

## Contribution

Contributions are welcome! If you have suggestions or want to improve the bot, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Stay informed with the Telegram News Bot! 📰🤖
