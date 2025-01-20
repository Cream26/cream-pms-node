import { EntityMetadata, MongoRepository, ObjectLiteral } from 'typeorm';

type Document = Record<string, any> & { _id?: string };

// 将 _id 转换为 id
export function mapObjectId<T = Document | Document[]>(data: T): T {
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map(item => mapObjectId(item)) as T;
  } else if (typeof data === 'object') {
    const res = data as Document;
    if ((res as Document)._id) {
      res.id = res._id;
      delete res._id;
    }
    Object.keys(res).forEach(key => {
      if (res[key] && typeof res[key] === 'object') {
        res[key] = mapObjectId(res[key]);
      }
    });
    return res as T;
  }
}

// 获取实体中不包含的属性
export function getFieldsByExcluded<T extends ObjectLiteral>(
  entity: MongoRepository<T>,
  excludedFields: (keyof T)[]
): (keyof T)[] {
  const metadata: EntityMetadata = entity.metadata;
  const allFields = metadata.columns.map(
    column => column.propertyName as keyof T
  );
  return allFields.filter(field => !excludedFields.includes(field));
}