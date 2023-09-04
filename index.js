const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const TOKEN = 'YOUR_BOT_API_TOKEN';
const IMG_FOLDER = './img';

const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/img/, (msg) => {
  const chatId = msg.chat.id;
  const imageFiles = getImagesFromFolder(IMG_FOLDER);

  if (imageFiles.length === 0) {
    bot.sendMessage(chatId, 'No images found in the folder.');
    return;
  }

  let currentIndex = 0;

  bot.sendPhoto(chatId, getImageStream(imageFiles[currentIndex]), {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Previous', callback_data: 'prev' },
          { text: 'Next', callback_data: 'next' },
        ],
      ],
    },
  });

  bot.on('callback_query', (callbackQuery) => {
    const data = callbackQuery.data;
    
    if (data === 'prev' && currentIndex > 0) {
      currentIndex--;
    } else if (data === 'next' && currentIndex < imageFiles.length - 1) {
      currentIndex++;
    }

    bot.editMessageMedia(
      {
        type: 'photo',
        media: getImageStream(imageFiles[currentIndex]),
      },
      {
        chat_id: callbackQuery.message.chat.id,
        message_id: callbackQuery.message.message_id,
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Previous', callback_data: 'prev' },
              { text: 'Next', callback_data: 'next' },
            ],
          ],
        },
      }
    );
  });
});

function getImagesFromFolder(folderPath) {
  const files = fs.readdirSync(folderPath);
  return files
    .filter((file) => {
      const fileExtension = path.extname(file).toLowerCase();
      return fileExtension === '.jpg' || fileExtension === '.png'; // Add more supported image formats if needed
    })
    .map((file) => path.join(folderPath, file));
}

function getImageStream(imagePath) {
  return fs.createReadStream(imagePath);
  }
          
