// проверка текста на рекламу и прочую фигню
export const checkShit = (text) => {
  const textForCheck = text.toLowerCase()
  if (textForCheck.includes("следите за актуальными новостями")) {
    return {toPost: false, ignoreNext: false}
  }
  if (textForCheck.includes("еще больше оперативных новостей смотрите в наших группах и подписывайтесь")) {
    return {toPost: false, ignoreNext: true}
  }
  return {toPost: true, ignoreNext: false}
}