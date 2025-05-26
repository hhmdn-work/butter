// app/types/index.ts or src/types/index.ts

export type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  [key: string]: string | number | null | undefined;
};
