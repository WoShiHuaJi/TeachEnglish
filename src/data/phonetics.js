export const vowels = [
  { group: '单元音 · 前元音', items: [
    { symbol: '/iː/', example: 'see', phonetic: '/siː/', cn: '看见', tip: '嘴角向两边咧开，像微笑，长音' },
    { symbol: '/ɪ/', example: 'sit', phonetic: '/sɪt/', cn: '坐', tip: '短促放松，介于"衣"和"诶"之间' },
    { symbol: '/e/', example: 'bed', phonetic: '/bed/', cn: '床', tip: '口型半开，舌尖抵下齿' },
    { symbol: '/æ/', example: 'cat', phonetic: '/kæt/', cn: '猫', tip: '口张大，舌尖抵下齿，俗称"梅花音"' },
  ]},
  { group: '单元音 · 中元音', items: [
    { symbol: '/ɜː/', example: 'bird', phonetic: '/bɜːd/', cn: '鸟', tip: '长音，舌身平放，嘴唇微微收圆' },
    { symbol: '/ə/', example: 'about', phonetic: '/əˈbaʊt/', cn: '关于', tip: '最放松的音，弱读音节常见' },
    { symbol: '/ʌ/', example: 'cup', phonetic: '/kʌp/', cn: '杯子', tip: '短促的"阿"，口型放松' },
  ]},
  { group: '单元音 · 后元音', items: [
    { symbol: '/uː/', example: 'food', phonetic: '/fuːd/', cn: '食物', tip: '嘴唇收圆突出，长音"乌"' },
    { symbol: '/ʊ/', example: 'book', phonetic: '/bʊk/', cn: '书', tip: '短促的"乌"，嘴唇稍放松' },
    { symbol: '/ɔː/', example: 'door', phonetic: '/dɔː/', cn: '门', tip: '长音"奥"，嘴唇收圆' },
    { symbol: '/ɒ/', example: 'hot', phonetic: '/hɒt/', cn: '热的', tip: '短促的"奥"，口张大' },
    { symbol: '/ɑː/', example: 'car', phonetic: '/kɑː/', cn: '汽车', tip: '长音"啊"，口尽量张大' },
  ]},
  { group: '双元音', items: [
    { symbol: '/eɪ/', example: 'day', phonetic: '/deɪ/', cn: '天', tip: '由 /e/ 滑向 /ɪ/' },
    { symbol: '/aɪ/', example: 'my', phonetic: '/maɪ/', cn: '我的', tip: '由 /a/ 滑向 /ɪ/，像"爱"' },
    { symbol: '/ɔɪ/', example: 'boy', phonetic: '/bɔɪ/', cn: '男孩', tip: '由 /ɔ/ 滑向 /ɪ/' },
    { symbol: '/əʊ/', example: 'go', phonetic: '/ɡəʊ/', cn: '去', tip: '由 /ə/ 滑向 /ʊ/，像"欧"' },
    { symbol: '/aʊ/', example: 'now', phonetic: '/naʊ/', cn: '现在', tip: '由 /a/ 滑向 /ʊ/，像"奥"' },
    { symbol: '/ɪə/', example: 'here', phonetic: '/hɪə/', cn: '这里', tip: '由 /ɪ/ 滑向 /ə/' },
    { symbol: '/eə/', example: 'hair', phonetic: '/heə/', cn: '头发', tip: '由 /e/ 滑向 /ə/' },
    { symbol: '/ʊə/', example: 'tour', phonetic: '/tʊə/', cn: '旅行', tip: '由 /ʊ/ 滑向 /ə/' },
  ]},
]

export const consonants = [
  { group: '爆破音', items: [
    { symbol: '/p/', example: 'pen', phonetic: '/pen/', cn: '钢笔', tip: '双唇紧闭后突然放开，送气，不振动声带' },
    { symbol: '/b/', example: 'bag', phonetic: '/bæɡ/', cn: '书包', tip: '与 /p/ 相同口型，但振动声带' },
    { symbol: '/t/', example: 'tea', phonetic: '/tiː/', cn: '茶', tip: '舌尖抵上齿龈，突然放开，不振动声带' },
    { symbol: '/d/', example: 'dog', phonetic: '/dɒɡ/', cn: '狗', tip: '与 /t/ 相同位置，但振动声带' },
    { symbol: '/k/', example: 'kite', phonetic: '/kaɪt/', cn: '风筝', tip: '舌后部抬起抵软腭，不振动声带' },
    { symbol: '/ɡ/', example: 'go', phonetic: '/ɡəʊ/', cn: '去', tip: '与 /k/ 相同位置，但振动声带' },
  ]},
  { group: '摩擦音', items: [
    { symbol: '/f/', example: 'fish', phonetic: '/fɪʃ/', cn: '鱼', tip: '上齿轻咬下唇，送气' },
    { symbol: '/v/', example: 'very', phonetic: '/ˈveri/', cn: '非常', tip: '与 /f/ 相同口型，振动声带' },
    { symbol: '/s/', example: 'sun', phonetic: '/sʌn/', cn: '太阳', tip: '舌尖接近上齿龈，气流从缝隙挤出' },
    { symbol: '/z/', example: 'zoo', phonetic: '/zuː/', cn: '动物园', tip: '与 /s/ 相同口型，振动声带' },
    { symbol: '/θ/', example: 'three', phonetic: '/θriː/', cn: '三', tip: '舌尖轻咬在上下齿之间，不振动声带' },
    { symbol: '/ð/', example: 'this', phonetic: '/ðɪs/', cn: '这个', tip: '与 /θ/ 相同口型，振动声带' },
    { symbol: '/ʃ/', example: 'she', phonetic: '/ʃiː/', cn: '她', tip: '像"嘘"，双唇微向前突出' },
    { symbol: '/ʒ/', example: 'usually', phonetic: '/ˈjuːʒuəli/', cn: '通常', tip: '与 /ʃ/ 相同口型，振动声带' },
    { symbol: '/h/', example: 'hat', phonetic: '/hæt/', cn: '帽子', tip: '气流从喉咙自由呼出，像呵气' },
    { symbol: '/r/', example: 'red', phonetic: '/red/', cn: '红色', tip: '舌尖向上卷起，不接触上颚' },
  ]},
  { group: '破擦音', items: [
    { symbol: '/tʃ/', example: 'chair', phonetic: '/tʃeə/', cn: '椅子', tip: '像"吃"，不振动声带' },
    { symbol: '/dʒ/', example: 'juice', phonetic: '/dʒuːs/', cn: '果汁', tip: '像"知"，振动声带' },
    { symbol: '/tr/', example: 'tree', phonetic: '/triː/', cn: '树', tip: '/t/ 与 /r/ 快速连读' },
    { symbol: '/dr/', example: 'drink', phonetic: '/drɪŋk/', cn: '喝', tip: '/d/ 与 /r/ 快速连读' },
    { symbol: '/ts/', example: 'cats', phonetic: '/kæts/', cn: '猫(复数)', tip: '像"次"，不振动声带' },
    { symbol: '/dz/', example: 'beds', phonetic: '/bedz/', cn: '床(复数)', tip: '与 /ts/ 相同口型，振动声带' },
  ]},
  { group: '鼻音 / 舌侧音 / 半元音', items: [
    { symbol: '/m/', example: 'mother', phonetic: '/ˈmʌðə/', cn: '妈妈', tip: '双唇紧闭，气流从鼻腔出' },
    { symbol: '/n/', example: 'nose', phonetic: '/nəʊz/', cn: '鼻子', tip: '舌尖抵上齿龈，气流从鼻腔出' },
    { symbol: '/ŋ/', example: 'sing', phonetic: '/sɪŋ/', cn: '唱歌', tip: '舌后部抵软腭，像拼音 eng' },
    { symbol: '/l/', example: 'like', phonetic: '/laɪk/', cn: '喜欢', tip: '舌尖抵上齿龈，气流从舌两侧出' },
    { symbol: '/w/', example: 'we', phonetic: '/wiː/', cn: '我们', tip: '双唇收圆突出，迅速滑向后面的元音' },
    { symbol: '/j/', example: 'yes', phonetic: '/jes/', cn: '是的', tip: '像很短的"衣"，迅速滑向后面的元音' },
  ]},
]

export const phonemeTotal =
  vowels.reduce((sum, g) => sum + g.items.length, 0) +
  consonants.reduce((sum, g) => sum + g.items.length, 0)
