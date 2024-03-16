import { SysMenu } from '../api/types';

// 包含选中/半选中状态的 SysMenu 树形结构
export interface MenuTree {
    tree: SysMenu[];
    checked: number[];
    halfChecked: number[];
}

/**
 * 构造 SysMenu 的树形结构，作为前端组件的 props
 *
 * @param nodes 节点列表
 * @param selectedSet 选中的节点集合
 * @returns MenuTree
 *
 */
export const buildMenuTree = (nodes: SysMenu[], selectedSet?: Set<number>): MenuTree => {
    if (!nodes) return { tree: [], checked: [], halfChecked: [] };

    // 选中的节点列表
    const checked: number[] = [];

    // 半选中的节点列表
    const halfChecked: number[] = [];

    // 半选中节点的父节点
    const parentOfHalfChectedNode: Set<number> = new Set();

    // 递归构建各个节点
    const buildChildren = (node: SysMenu, allNodes: SysMenu[]) => {
        let children: SysMenu[] | undefined;
        let selectedChildCount = 0;
        allNodes.forEach((o) => {
            if (o.parentId === node.id) {
                if (children === undefined) children = [];
                children.push(buildChildren(o, allNodes));

                if (selectedSet?.has(o.id)) selectedChildCount++;
            }
        });
        node.children = children;

        // 检查节点的选中状态
        if (selectedSet?.has(node.id)) {
            // 如果一个节点是半选中状态，那它的父节点也肯定是半选中状态
            // 如果一个节点属于 selectedSet，但是它的子节点没有全都选中，那它应该是半选中状态
            if (parentOfHalfChectedNode.has(node.id) || (children && selectedChildCount < children.length)) {
                halfChecked.push(node.id);

                // 保存父节点到集合中
                if (node.parentId > 0) parentOfHalfChectedNode.add(node.parentId);
            } else {
                checked.push(node.id);
            }
        }

        return node;
    };

    const menuTree: SysMenu[] = [];
    nodes.forEach((item) => {
        if (item.parentId == 0) menuTree.push(buildChildren(item, nodes));
    });
    return { tree: menuTree, checked, halfChecked };
};
