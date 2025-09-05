export interface IRequestTransform {
  transform(request: RequestInit): RequestInit;
};
