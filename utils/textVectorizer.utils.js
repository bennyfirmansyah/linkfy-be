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

    // Expanded synonym dictionary
    this.synonymDictionary = new Map([
      ['web', new Set(['website', 'webpage', 'web', 'situs', 'laman', 'halaman web'])],
      ['website', new Set(['web', 'webpage', 'website', 'situs', 'laman', 'halaman web'])],
      ['aplikasi', new Set(['app', 'application', 'software', 'perangkat lunak', 'program'])],
      ['login', new Set(['masuk', 'log in', 'signin', 'sign in'])],
      ['logout', new Set(['keluar', 'log out', 'signout', 'sign out'])],
      ['password', new Set(['kata sandi', 'sandi', 'katasandi', 'passkey'])],
      ['user', new Set(['pengguna', 'pemakai', 'user', 'account'])],
      ['database', new Set(['basis data', 'data', 'db', 'pangkalan data'])],
      ['email', new Set(['surel', 'e-mail', 'mail', 'pos elektronik'])],
      ['admin', new Set(['administrator', 'pengelola', 'pengurus'])],
      ['profile', new Set(['profil', 'biodata', 'data diri'])],
      ['search', new Set(['cari', 'pencarian', 'telusur'])],
      ['download', new Set(['unduh', 'mengunduh', 'ambil'])],
      ['upload', new Set(['unggah', 'mengunggah', 'upload'])],
      ['form', new Set(['formulir', 'isian', 'borang'])],
      ['menu', new Set(['menu', 'pilihan', 'navigasi'])]
    ]);
    
    // Window size for context analysis
    this.contextWindowSize = 3;
  }

  // Implement Levenshtein distance for fuzzy matching
  calculateLevenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitute = matrix[j - 1][i - 1] + (str1[i - 1] !== str2[j - 1] ? 1 : 0);
        matrix[j][i] = Math.min(
          matrix[j - 1][i] + 1, // deletion
          matrix[j][i - 1] + 1, // insertion
          substitute // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  // Find similar words using fuzzy matching
  findSimilarWords(word, threshold = 2) {
    const similar = new Set();
    
    // Check against synonym dictionary
    for (const [key, values] of this.synonymDictionary.entries()) {
      if (this.calculateLevenshteinDistance(word, key) <= threshold) {
        values.forEach(value => similar.add(value));
      }
      values.forEach(value => {
        if (this.calculateLevenshteinDistance(word, value) <= threshold) {
          similar.add(key);
          values.forEach(v => similar.add(v));
        }
      });
    }

    return Array.from(similar);
  }

  // Analyze word context in a sentence
  analyzeWordContext(tokens, index) {
    const contextWords = [];
    const start = Math.max(0, index - this.contextWindowSize);
    const end = Math.min(tokens.length, index + this.contextWindowSize + 1);

    for (let i = start; i < end; i++) {
      if (i !== index) {
        contextWords.push(tokens[i]);
      }
    }

    return contextWords;
  }

  cleanText(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  tokenizeAndRemoveStopwords(text) {
    const cleanedText = this.cleanText(text);
    const tokens = tokenizer.tokenize(cleanedText);
    const filteredTokens = tokens.filter(token => !this.stopwords.has(token));
    
    // Expanded token processing
    const expandedTokens = new Set();
    
    for (let i = 0; i < filteredTokens.length; i++) {
      const token = filteredTokens[i];
      
      // Add original token
      expandedTokens.add(token);
      
      // Add stemmed version
      expandedTokens.add(this.stemmer.stem(token));
      
      // Add synonyms
      if (this.synonymDictionary.has(token)) {
        this.synonymDictionary.get(token).forEach(syn => expandedTokens.add(syn));
      }
      
      // Add fuzzy matches
      this.findSimilarWords(token).forEach(similar => expandedTokens.add(similar));
      
      // Add context words
      const contextWords = this.analyzeWordContext(filteredTokens, i);
      contextWords.forEach(contextWord => expandedTokens.add(contextWord));
    }
    
    return Array.from(expandedTokens);
  }

  generateVector(title, description) {
    this.tfidf = new TfIdf();
    
    const titleTokens = this.tokenizeAndRemoveStopwords(title);
    const descTokens = this.tokenizeAndRemoveStopwords(description || '');
    
    // Add tokens with weights
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
        contextWindowSize: this.contextWindowSize,
        vectorCreatedAt: new Date().toISOString()
      }
    };
  }

  calculateSimilarity(vector1, vector2) {
    // Combined similarity score using multiple metrics
    const tfidfWeight = 0.7;
    const contextWeight = 0.3;
    
    // Calculate TF-IDF similarity
    const tfidfSimilarity = this.calculateTfidfSimilarity(vector1, vector2);
    
    // Calculate context similarity
    const contextSimilarity = this.calculateContextSimilarity(vector1, vector2);
    
    // Combine scores
    return (tfidfSimilarity * tfidfWeight) + (contextSimilarity * contextWeight);
  }

  calculateTfidfSimilarity(vector1, vector2) {
    const terms = new Set([...Object.keys(vector1), ...Object.keys(vector2)]);
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (const term of terms) {
      // Get base values
      let v1 = vector1[term] || 0;
      let v2 = vector2[term] || 0;
      
      // Check synonyms if no direct match
      if (v1 === 0 || v2 === 0) {
        const synonyms = this.findSimilarWords(term);
        for (const synonym of synonyms) {
          v1 = Math.max(v1, vector1[synonym] || 0);
          v2 = Math.max(v2, vector2[synonym] || 0);
        }
      }
      
      dotProduct += v1 * v2;
      norm1 += v1 * v1;
      norm2 += v2 * v2;
    }
    
    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  calculateContextSimilarity(vector1, vector2) {
    // Simple context overlap calculation
    const context1 = new Set(Object.keys(vector1));
    const context2 = new Set(Object.keys(vector2));
    
    const intersection = new Set([...context1].filter(x => context2.has(x)));
    const union = new Set([...context1, ...context2]);
    
    return intersection.size / union.size;
  }
}

module.exports = new TextVectorizer();