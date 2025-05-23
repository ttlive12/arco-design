import { useState, Key } from 'react';
import { TableProps, GetRowKeyType } from '../interface';
import { isChildrenNotEmpty, getOriginData } from '../utils';

export default function useExpand<T>(
  props: TableProps<T>,
  flattenData,
  getRowKey: GetRowKeyType<T>
): [Key[], (key: Key) => void] {
  const {
    defaultExpandedRowKeys,
    defaultExpandAllRows,
    expandedRowRender,
    onExpand,
    onExpandedRowsChange,
    childrenColumnName = 'children',
    expandProps,
  } = props;
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>(getDefaultExpandedRowKeys());
  const mergedExpandedRowKeys = props.expandedRowKeys || expandedRowKeys;

  function getDefaultExpandedRowKeys() {
    let rows: React.Key[] = [];
    if (props.expandedRowKeys) {
      rows = props.expandedRowKeys;
    } else if (defaultExpandedRowKeys) {
      rows = defaultExpandedRowKeys;
    } else if (defaultExpandAllRows) {
      rows = flattenData
        .map((item, index) => {
          const originItem = getOriginData(item);
          if (
            expandProps &&
            'rowExpandable' in expandProps &&
            typeof expandProps.rowExpandable === 'function'
          ) {
            return expandProps.rowExpandable(originItem) && getRowKey(item, index);
          }
          if (typeof expandedRowRender === 'function') {
            return expandedRowRender(originItem, index) && getRowKey(item, index);
          }
          return isChildrenNotEmpty(item, childrenColumnName) && getRowKey(item, index);
        })
        .filter((x) => x);
    }
    return rows;
  }

  function onClickExpandBtn(key: React.Key) {
    const isExpanded = mergedExpandedRowKeys.indexOf(key) === -1;
    const newExpandedRowKeys = isExpanded
      ? mergedExpandedRowKeys.concat(key)
      : mergedExpandedRowKeys.filter((_k) => key !== _k);
    const sortedExpandedRowKeys = flattenData
      .filter((record, index) => newExpandedRowKeys.indexOf(getRowKey(record, index)) !== -1)
      .map((record, index) => getRowKey(record, index));

    setExpandedRowKeys(sortedExpandedRowKeys);
    handleExpandChange(key, isExpanded);
    onExpandedRowsChange && onExpandedRowsChange(sortedExpandedRowKeys as string[]);
  }

  function handleExpandChange(key: React.Key, expanded: boolean) {
    onExpand &&
      onExpand(getOriginData(flattenData.find((item, index) => getRowKey(item, index) === key)), expanded);
  }

  return [mergedExpandedRowKeys, onClickExpandBtn];
}
