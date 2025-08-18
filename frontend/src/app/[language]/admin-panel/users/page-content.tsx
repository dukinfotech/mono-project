"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import {
  PropsWithChildren,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { useGetUsersQuery, usersQueryKeys } from "./queries/queries";
import { TableVirtuoso } from "react-virtuoso";
import { User } from "@/services/api/types/user";
import NextLink from "next/link";
import useAuth from "@/services/auth/use-auth";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import { useDeleteUsersService } from "@/services/api/services/users";
import removeDuplicatesFromArrayObjects from "@/services/helpers/remove-duplicates-from-array-of-objects";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import UserFilter from "./user-filter";
import { useRouter, useSearchParams } from "next/navigation";
import { UserFilterType, UserSortType } from "./user-filter-types";
import { SortEnum } from "@/services/api/types/sort-type";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type UsersKeys = keyof User;

function TableSortCellWrapper(
  props: PropsWithChildren<{
    width?: number;
    orderBy: UsersKeys;
    order: SortEnum;
    column: UsersKeys;
    handleRequestSort: (
      event: React.MouseEvent<unknown>,
      property: UsersKeys
    ) => void;
  }>
) {
  return (
    <TableCell
      style={{ width: props.width }}
      className="cursor-pointer select-none"
      onClick={(event) => props.handleRequestSort(event, props.column)}
    >
      <span className="flex items-center gap-1">
        {props.children}
        {props.orderBy === props.column && (
          <span>
            {props.order === SortEnum.ASC ? "▲" : "▼"}
          </span>
        )}
      </span>
    </TableCell>
  );
}

function Actions({ user }: { user: User }) {
  const { user: authUser } = useAuth();
  const { confirmDialog } = useConfirmDialog();
  const fetchUserDelete = useDeleteUsersService();
  const queryClient = useQueryClient();
  const canDelete = user.id !== authUser?.id;
  const { t: tUsers } = useTranslation("admin-panel-users");

  const handleDelete = async () => {
    const isConfirmed = await confirmDialog({
      title: tUsers("admin-panel-users:confirm.delete.title"),
      message: tUsers("admin-panel-users:confirm.delete.message"),
    });

    if (isConfirmed) {
      const searchParams = new URLSearchParams(window.location.search);
      const searchParamsFilter = searchParams.get("filter");
      const searchParamsSort = searchParams.get("sort");

      let filter: UserFilterType | undefined = undefined;
      let sort: UserSortType | undefined = {
        order: SortEnum.DESC,
        orderBy: "id",
      };

      if (searchParamsFilter) {
        filter = JSON.parse(searchParamsFilter);
      }

      if (searchParamsSort) {
        sort = JSON.parse(searchParamsSort);
      }

      const previousData = queryClient.getQueryData<
        InfiniteData<{ nextPage: number; data: User[] }>
      >(usersQueryKeys.list().sub.by({ sort, filter }).key);

      await queryClient.cancelQueries({ queryKey: usersQueryKeys.list().key });

      const newData = previousData
        ? {
            ...previousData,
            pages: previousData.pages.map((page) => ({
              ...page,
              data: page.data.filter((item) => item.id !== user.id),
            })),
          }
        : undefined;

      if (newData) {
        queryClient.setQueryData(
          usersQueryKeys.list().sub.by({ sort, filter }).key,
          newData
        );
      }

      await fetchUserDelete({
        id: user.id,
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        asChild
        variant="default"
        className="px-3"
      >
        <NextLink href={`/admin-panel/users/edit/${user.id}`}>
          {tUsers("admin-panel-users:actions.edit")}
        </NextLink>
      </Button>
      {canDelete && (
        <Button
          size="sm"
          variant="destructive"
          className="px-3"
          onClick={handleDelete}
        >
          {tUsers("admin-panel-users:actions.delete")}
        </Button>
      )}
    </div>
  );
}

function Users() {
  const { t: tUsers } = useTranslation("admin-panel-users");
  const { t: tRoles } = useTranslation("admin-panel-roles");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [{ order, orderBy }, setSort] = useState<{
    order: SortEnum;
    orderBy: UsersKeys;
  }>(() => {
    const searchParamsSort = searchParams.get("sort");
    if (searchParamsSort) {
      return JSON.parse(searchParamsSort);
    }
    return { order: SortEnum.DESC, orderBy: "id" };
  });

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: UsersKeys
  ) => {
    const isAsc = orderBy === property && order === SortEnum.ASC;
    const searchParams = new URLSearchParams(window.location.search);
    const newOrder = isAsc ? SortEnum.DESC : SortEnum.ASC;
    const newOrderBy = property;
    searchParams.set(
      "sort",
      JSON.stringify({ order: newOrder, orderBy: newOrderBy })
    );
    setSort({
      order: newOrder,
      orderBy: newOrderBy,
    });
    router.push(window.location.pathname + "?" + searchParams.toString());
  };

  const filter = useMemo(() => {
    const searchParamsFilter = searchParams.get("filter");
    if (searchParamsFilter) {
      return JSON.parse(searchParamsFilter) as UserFilterType;
    }

    return undefined;
  }, [searchParams]);

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useGetUsersQuery({ filter, sort: { order, orderBy } });

  const handleScroll = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const result = useMemo(() => {
    const result =
      (data?.pages?.flatMap((page) => page?.data) as User[]) ?? ([] as User[]);

    return removeDuplicatesFromArrayObjects(result, "id");
  }, [data]);

  return (
    <div className="max-w-screen-xl mx-auto px-2 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold">{tUsers("admin-panel-users:title")}</h1>
        <div className="flex gap-2 items-center">
          <UserFilter />
          <Button asChild>
            <NextLink href="/admin-panel/users/create">
              {tUsers("admin-panel-users:actions.create")}
            </NextLink>
          </Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <div style={{ height: 500 }}>
            <TableVirtuoso
              data={result}
              endReached={handleScroll}
              overscan={20}
              useWindowScroll
              increaseViewportBy={400}
              components={{
                Table: (props) => (
                  <Table className="min-w-full border">{props.children}</Table>
                ),
                TableHead: (props) => <TableHead>{props.children}</TableHead>,
                TableRow: (props) => <TableRow>{props.children}</TableRow>,
                TableBody: (props) => <TableBody>{props.children}</TableBody>,
              }}
              fixedHeaderContent={() => (
                <TableRow>
                  <TableCell style={{ width: 50 }} />
                  <TableSortCellWrapper
                    width={100}
                    orderBy={orderBy}
                    order={order}
                    column="id"
                    handleRequestSort={handleRequestSort}
                  >
                    {tUsers("admin-panel-users:table.column1")}
                  </TableSortCellWrapper>
                  <TableCell style={{ width: 200 }}>
                    {tUsers("admin-panel-users:table.column2")}
                  </TableCell>
                  <TableSortCellWrapper
                    orderBy={orderBy}
                    order={order}
                    column="email"
                    handleRequestSort={handleRequestSort}
                  >
                    {tUsers("admin-panel-users:table.column3")}
                  </TableSortCellWrapper>
                  <TableCell style={{ width: 80 }}>
                    {tUsers("admin-panel-users:table.column4")}
                  </TableCell>
                  <TableCell style={{ width: 130 }} />
                </TableRow>
              )}
              itemContent={(_, user) => (
                <>
                  <TableCell style={{ width: 50 }}>
                    <Avatar
                      
                    />
                  </TableCell>
                  <TableCell style={{ width: 100 }}>{user?.id}</TableCell>
                  <TableCell style={{ width: 200 }}>
                    {user?.firstName} {user?.lastName}
                  </TableCell>
                  <TableCell>{user?.email}</TableCell>
                  <TableCell style={{ width: 80 }}>
                    {tRoles(`role.${user?.role?.id}`)}
                  </TableCell>
                  <TableCell style={{ width: 130 }}>
                    {!!user && <Actions user={user} />}
                  </TableCell>
                </>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default withPageRequiredAuth(Users, { roles: [RoleEnum.ADMIN] });