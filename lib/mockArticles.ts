export type MockArticle = {
  slug: string;
  title: string;
  authors: { fullName: string }[];
  journal: string;
  year: number;
  topics: string[];
  abstract: string;
  pdfUrl?: string;
  doi?: string;
};

// Backward compatibility alias
export type Article = MockArticle;

export const slugify = (input: string) =>
  input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const create = (title: string, data: Omit<MockArticle, "slug" | "title">): MockArticle => ({
  title,
  slug: slugify(title),
  ...data,
});

export const mockArticles: MockArticle[] = [
  create("Attention Is All You Need", {
    authors: [
      { fullName: "Ashish Vaswani" },
      { fullName: "Noam Shazeer" },
      { fullName: "Niki Parmar" },
      { fullName: "Jakob Uszkoreit" },
      { fullName: "Llion Jones" },
      { fullName: "Aidan N. Gomez" },
      { fullName: "Łukasz Kaiser" },
      { fullName: "Illia Polosukhin" },
    ],
    journal: "arXiv",
    year: 2017,
    topics: ["Sun'iy intellekt", "Transformers"],
    abstract:
      "Transformer arxitekturasi diqqat mexanizmlaridan foydalanib, takroriy va konvolyutsion qatlamlarga ehtiyojni yo‘q qiladi.",
    pdfUrl: "https://arxiv.org/pdf/1706.03762.pdf",
  }),
  create("Deep Residual Learning for Image Recognition", {
    authors: [
      { fullName: "Kaiming He" },
      { fullName: "Xiangyu Zhang" },
      { fullName: "Shaoqing Ren" },
      { fullName: "Jian Sun" },
    ],
    journal: "arXiv",
    year: 2015,
    topics: ["Kompyuter ko‘rish", "Neyron tarmoqlar"],
    abstract: "ResNet arxitekturasi chuqur tarmoqlarda pasayib ketadigan gradient muammosini kamaytiradi.",
    pdfUrl: "https://arxiv.org/pdf/1512.03385.pdf",
  }),
  create("BERT: Pre-training of Deep Bidirectional Transformers", {
    authors: [
      { fullName: "Jacob Devlin" },
      { fullName: "Ming-Wei Chang" },
      { fullName: "Kenton Lee" },
      { fullName: "Kristina Toutanova" },
    ],
    journal: "arXiv",
    year: 2019,
    topics: ["NLP", "Transformers"],
    abstract: "BERT ikki yo‘nalishli pre-trening yordamida ko‘plab NLP vazifalarida ilg‘or natijalar beradi.",
    pdfUrl: "https://arxiv.org/pdf/1810.04805.pdf",
  }),
  create("Neural Machine Translation by Jointly Learning to Align and Translate", {
    authors: [
      { fullName: "Dzmitry Bahdanau" },
      { fullName: "Kyunghyun Cho" },
      { fullName: "Yoshua Bengio" },
    ],
    journal: "arXiv",
    year: 2014,
    topics: ["NLP", "Mashina tarjimasi"],
    abstract: "E'tibor mexanizmi bilan LSTM asosidagi tarjima modeli natijalarni yaxshilaydi.",
    pdfUrl: "https://arxiv.org/pdf/1409.0473.pdf",
  }),
  create("Sequence to Sequence Learning with Neural Networks", {
    authors: [
      { fullName: "Ilya Sutskever" },
      { fullName: "Oriol Vinyals" },
      { fullName: "Quoc V. Le" },
    ],
    journal: "NeurIPS",
    year: 2014,
    topics: ["NLP", "Seq2Seq"],
    abstract: "Kodlovchi-dekodlovchi LSTM yordamida ketma-ketlikdan ketma-ketlikka o‘rganish taklif qilinadi.",
    pdfUrl: "https://arxiv.org/pdf/1409.3215.pdf",
  }),
];

