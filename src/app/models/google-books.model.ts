export interface RespuestaGoogleBooks {
  totalItems: number;
  items?: {
    volumeInfo: VolumenGoogleBooks;
  }[];
}

export interface VolumenGoogleBooks {
  title: string;
  authors?: string[];
  description?: string;
  industryIdentifiers?: IdentificadorGoogleBooks[];
  categories?: string[];
  imageLinks?: ImagenesGoogleBooks;
}

export interface IdentificadorGoogleBooks {
  type: string;
  identifier: string;
}

export interface ImagenesGoogleBooks {
  thumbnail?: string;
}
