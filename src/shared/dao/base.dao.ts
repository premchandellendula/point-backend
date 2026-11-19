import { Result, ResultCode, ResultWithCount } from "../result/result.js";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PrismaDelegate {
    create(args: any): PromiseLike<any>;
    findUnique(args: any): PromiseLike<any>;
    findMany(args: any): PromiseLike<any>;
    update(args: any): PromiseLike<any>;
    delete(args: any): PromiseLike<any>;
    count(args: any): PromiseLike<any>;
}

export interface ReadManyOptions<TWhere>{
    page?: number;
    count?: number;
    order?: "ASC" | "DESC";
    field?: string;
    where?: TWhere;
    select?: Record<string, unknown>;
    nonPaginated?: boolean;
}

const isRecordNotFound = (e: unknown) => typeof e === "object" && e !== null && (e as { code?: string }).code === "P2025";

export abstract class BaseDao<
    TModel,
    TId extends number | string = number,
    TCreate = any,
    TUpdate = any,
    TWhere = any,
>{
    protected constructor(
        protected readonly delegate: PrismaDelegate,
        protected readonly entityName: string,
    ) {}

    protected logError(op: string, error: unknown){
        console.log(`[${this.entityName}/${op}]`, error);
    }

    async create(data: TCreate): Promise<Result<{ id: TId }>> {
        try {
            const row = await this.delegate.create({ data, select: { id: true}});
            return new Result(false, ResultCode.Created, "Success in insert", { id: row.id as TId })
        } catch (error) {
            this.logError("create", error);
            return new Result(true, ResultCode.InternalServerError, "Error in insert");
        }
    }

    async read<R = TModel>(id: TId, select?: Record<string, unknown>): Promise<Result<R>> {
        try {
            const row = await this.delegate.findUnique({
                where: { id },
                ...(select ? { select }: {})
            });
            if(!row) return new Result(true, ResultCode.NotFound, "Not found");
            return new Result(false, ResultCode.Success, "Success in read", row as R);
        } catch (error) {
            this.logError("read", error);
            return new Result(true, ResultCode.InternalServerError, "Error in reading");
        }
    }

    async readMany<R = TModel>(options: ReadManyOptions<TWhere> = {}): Promise<ResultWithCount<R[]>> {
        const {
            page = 1,
            count = 10,
            order = "DESC",
            field = "createdAt",
            where,
            select,
            nonPaginated = false,
        } = options;

        try {
            const [rows, total] = await Promise.all([
                this.delegate.findMany({
                    where,
                    orderBy: { [field]: order.toLowerCase() },
                    ...(select ? { select } : {}),
                    ...(nonPaginated ? {} : { skip: (page - 1) * count, take: count }),
                }),
                this.delegate.count({ where }),
            ]);
            return new ResultWithCount(false, ResultCode.Success, "Success in readMany", rows as R[], total);
        } catch (error) {
            this.logError("readMany", error);
            return new ResultWithCount<R[]>(
                true, ResultCode.InternalServerError, "Error in reading", undefined, null,
            );
        }
    }

    async update(id: TId, data: TUpdate): Promise<Result<{ id: TId }>> {
        try {
            await this.delegate.update({ where: { id }, data, select: { id: true }});
            return new Result(false, ResultCode.Success, "Success in update", { id });
        } catch (error) {
            if(isRecordNotFound(error)){
                return new Result(true, ResultCode.NoUpdatesPerformed, "No updated performed");
            }
            this.logError("update", error);
            return new Result(true, ResultCode.InternalServerError, "Error in updating");
        }
    }

    async delete(id: TId): Promise<Result<{ id: TId }>> {
        try {
            await this.delegate.delete({ where: { id }, select: { if: true } });
            return new Result(false, ResultCode.Success, "Success in delete", { id });
        } catch (error) {
            if (isRecordNotFound(error)) {
                return new Result(true, ResultCode.NotFound, "Not found");
            }
            this.logError("delete", error);
            return new Result(true, ResultCode.InternalServerError, "Error in deleting");
        }
    }
}