export interface IPostInfo {
  author: string;
  time: string;
  text: string;
  replies?: IPostInfo[];
}
