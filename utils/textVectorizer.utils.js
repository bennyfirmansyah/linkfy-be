const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;
const wordnet = natural.WordNet();

class TextVectorizer {
  constructor() {
    this.tfidf = new TfIdf();
    this.stemmer = natural.PorterStemmer;
    this.stopwords = new Set([
      'yang', 'di', 'ke', 'dari', 'pada', 'dalam', 'untuk', 'dengan', 'dan', 'atau',
      'ini', 'itu', 'juga', 'sudah', 'saya', 'anda', 'dia', 'mereka', 'kita', 'akan',
      'bisa', 'ada', 'tidak', 'saat', 'oleh', 'setelah', 'tentang', 'seperti', 'ketika',
      'bagi', 'sampai', 'karena', 'jika', 'namun', 'serta', 'dimana', 'kapan', 'mengapa'
    ]);
    
    // Tambahan word relations untuk Bahasa Indonesia
    this.wordRelations = new Map([
      ['web', new Set(['website', 'webpage', 'web', 'situs'])],
      ['website', new Set(['web', 'webpage', 'website', 'situs'])],
      ['aplikasi', new Set(['app', 'application', 'software', 'perangkat lunak'])],
      ['app', new Set(['app', 'application', 'software', 'perangkat lunak'])],
      ['software', new Set(['app', 'application', 'software', 'perangkat lunak'])],
      ['perangkat lunak', new Set(['app', 'application', 'software', 'perangkat lunak'])],
      ['situs', new Set(['website', 'webpage', 'web', 'situs'])],
      ['yt', new Set(['youtube', 'video', 'yt'])],
      ['youtube', new Set(['yt', 'video', 'youtube'])],
      // Tambahkan relasi kata lainnya sesuai kebutuhan
    ]);
  }

  isStopwordOnly(text) {
    const cleanedText = this.cleanText(text);
    const tokens = tokenizer.tokenize(cleanedText);
    return tokens.length > 0 && tokens.every(token => this.stopwords.has(token));
  }

  cleanText(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Menambahkan fungsi untuk mendapatkan related terms
  getRelatedTerms(term) {
    const stemmedTerm = this.stemmer.stem(term);
    const related = new Set([term, stemmedTerm]);
    
    // Cek dari word relations
    for (const [key, values] of this.wordRelations.entries()) {
      if (key.includes(term) || term.includes(key)) {
        values.forEach(value => related.add(value));
      }
    }
    
    return Array.from(related);
  }

  tokenizeAndRemoveStopwords(text) {
    const cleanedText = this.cleanText(text);
    const tokens = tokenizer.tokenize(cleanedText);
    const filteredTokens = tokens.filter(token => !this.stopwords.has(token));
    
    // Expand tokens dengan related terms
    const expandedTokens = [];
    filteredTokens.forEach(token => {
      expandedTokens.push(token);
      expandedTokens.push(this.stemmer.stem(token));
      this.getRelatedTerms(token).forEach(related => {
        expandedTokens.push(related);
      });
    });
    
    return [...new Set(expandedTokens)]; // Menghilangkan duplikat
  }

  generateVector(title, description) {
    this.tfidf = new TfIdf();
    
    const titleTokens = this.tokenizeAndRemoveStopwords(title);
    const descTokens = this.tokenizeAndRemoveStopwords(description || '');
    
    // Menambahkan tokens dengan bobot
    this.tfidf.addDocument([...titleTokens, ...titleTokens, ...descTokens]);
    
    const vector = {};
    this.tfidf.listTerms(0).forEach(item => {
      vector[item.term] = item.tfidf;
    });

    return {
      vector,
      metadata: {
        titleLength: titleTokens.length,
        descriptionLength: descTokens.length,
        uniqueTerms: Object.keys(vector).length,
        vectorCreatedAt: new Date().toISOString()
      }
    };
  }

  calculateSimilarity(vector1, vector2) {
    // Mengumpulkan semua related terms dari kedua vektor
    const terms = new Set();
    
    for (const term of [...Object.keys(vector1), ...Object.keys(vector2)]) {
      terms.add(term);
      this.getRelatedTerms(term).forEach(related => terms.add(related));
    }
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (const term of terms) {
      let v1 = vector1[term] || 0;
      let v2 = vector2[term] || 0;
      
      // Jika term tidak ditemukan, cek related terms
      if (v1 === 0 || v2 === 0) {
        const relatedTerms = this.getRelatedTerms(term);
        for (const related of relatedTerms) {
          v1 = Math.max(v1, vector1[related] || 0);
          v2 = Math.max(v2, vector2[related] || 0);
        }
      }
      
      dotProduct += v1 * v2;
      norm1 += v1 * v1;
      norm2 += v2 * v2;
    }
    
    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }
}

module.exports = new TextVectorizer();