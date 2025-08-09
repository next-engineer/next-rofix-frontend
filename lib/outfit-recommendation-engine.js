// Outfit recommendation logic (with emojis-based weather mapping)
class OutfitRecommendationEngine {
  constructor() {
    this.weatherOutfits = {
      hot: {
        items: ["린넨 셔츠", "반바지", "샌들", "선글라스"],
        colors: ["화이트", "베이지", "라이트 블루", "민트"],
        style: "시원하고 통기성 좋은",
      },
      cold: {
        items: ["니트", "코트", "부츠", "머플러"],
        colors: ["네이비", "그레이", "블랙", "브라운"],
        style: "따뜻하고 포근한",
      },
      sunny: {
        items: ["블라우스", "치마", "로퍼", "햇"],
        colors: ["파스텔", "화이트", "옐로우", "핑크"],
        style: "밝고 경쾌한",
      },
      cloudy: {
        items: ["가디건", "청바지", "스니커즈"],
        colors: ["그레이", "네이비", "베이지"],
        style: "편안하고 캐주얼한",
      },
      rainy: {
        items: ["트렌치코트", "레인부츠", "우산"],
        colors: ["네이비", "카키", "블랙"],
        style: "실용적이고 세련된",
      },
    }
    this.personalColorPalettes = {
      spring: ["코랄", "피치", "아이보리", "라이트 그린"],
      summer: ["라벤더", "로즈", "소프트 블루", "그레이"],
      autumn: ["러스트", "올리브", "머스타드", "브라운"],
      winter: ["로얄 블루", "에메랄드", "퓨어 화이트", "블랙"],
    }
  }

  getRecommendation(weather, personalColor) {
    const weatherData = this.weatherOutfits[weather]
    const colorPalette = this.personalColorPalettes[personalColor]
    if (!weatherData || !colorPalette) return null
    return {
      items: weatherData.items,
      recommendedColors: colorPalette,
      style: weatherData.style,
      description: `${weatherData.style} 스타일로 ${personalColor} 톤에 어울리는 컬러를 활용해보세요.`,
    }
  }

  generateOutfitCombinations(weather, personalColor) {
    const rec = this.getRecommendation(weather, personalColor)
    if (!rec) return []
    return [
      { name: "데일리 캐주얼", items: rec.items.slice(0, 3), colors: rec.recommendedColors.slice(0, 2) },
      { name: "오피스 룩", items: ["블라우스", "슬랙스", "로퍼"], colors: rec.recommendedColors.slice(1, 3) },
      { name: "데이트 룩", items: ["원피스", "카디건", "힐"], colors: rec.recommendedColors.slice(2, 4) },
    ]
  }
}

if (typeof window !== "undefined") window.OutfitRecommendationEngine = OutfitRecommendationEngine
export default OutfitRecommendationEngine
