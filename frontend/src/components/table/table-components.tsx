import { Ref } from "react";
import {
  Table,
  TableBody,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ScrollerProps,
  TableComponents as TableComponentsType,
} from "react-virtuoso";

const TableComponents = {
  Scroller: function Scroller(
    props: ScrollerProps & { ref?: Ref<HTMLDivElement> }
  ) {
    return (
      <div
        ref={props.ref}
        className="overflow-auto border rounded-md"
        {...props}
      />
    );
  },
  Table: (props: React.ComponentProps<typeof Table>) => (
    <Table {...props} className="border-collapse-separate" />
  ),
  TableHead: TableHeader as unknown as TableComponentsType["TableHead"],
  TableFoot: TableFooter as unknown as TableComponentsType["TableFoot"],
  TableRow: TableRow,
  TableBody: function BodyTable(
    props: React.ComponentProps<typeof TableBody> & {
      ref?: Ref<HTMLTableSectionElement>;
    }
  ) {
    return <TableBody {...props} ref={props.ref} />;
  },
};

export default TableComponents;
