// Clothes management (from your attachment)
class ClothesManager {
  constructor() {
    this.clothes = this.loadClothes()
  }

  loadClothes() {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("myClothes")
      return saved ? JSON.parse(saved) : []
    }
    return []
  }

  saveClothes() {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("myClothes", JSON.stringify(this.clothes))
    }
  }

  addClothing(clothingData) {
    const newClothing = {
      id: Date.now(),
      ...clothingData,
      dateAdded: new Date().toISOString(),
    }
    this.clothes.push(newClothing)
    this.saveClothes()
    return newClothing
  }

  removeClothing(id) {
    this.clothes = this.clothes.filter((item) => item.id !== id)
    this.saveClothes()
  }

  updateClothing(id, updates) {
    const idx = this.clothes.findIndex((i) => i.id === id)
    if (idx > -1) {
      this.clothes[idx] = { ...this.clothes[idx], ...updates }
      this.saveClothes()
      return this.clothes[idx]
    }
    return null
  }

  getClothingByCategory(category) {
    return this.clothes.filter((i) => i.category === category)
  }
  getClothingByColor(color) {
    return this.clothes.filter((i) => i.color === color)
  }
  getClothingBySeason(season) {
    return this.clothes.filter((i) => i.season === season || i.season === "all")
  }
  searchClothes(query) {
    const q = query.toLowerCase()
    return this.clothes.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.brand.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q),
    )
  }
  getAllClothes() {
    return [...this.clothes]
  }
  getClothesStats() {
    const stats = { total: this.clothes.length, byCategory: {}, byColor: {}, bySeason: {} }
    this.clothes.forEach((i) => {
      stats.byCategory[i.category] = (stats.byCategory[i.category] || 0) + 1
      stats.byColor[i.color] = (stats.byColor[i.color] || 0) + 1
      stats.bySeason[i.season] = (stats.bySeason[i.season] || 0) + 1
    })
    return stats
  }
}

if (typeof window !== "undefined") {
  window.ClothesManager = ClothesManager
}
export default ClothesManager
