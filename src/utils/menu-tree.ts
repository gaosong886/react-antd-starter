import { API } from '../api';

export interface MenuTree {
    tree: API.SysMenu[];
    checked: number[];
    halfChecked: number[];
}

/**
 * Build tree structure.
 *
 * @param nodes Array of nodes.
 * @returns Array of built tree structure.
 *
 */
export const buildMenuTree = (nodes: API.SysMenu[], selectedSet?: Set<number>): MenuTree => {
    if (!nodes) return { tree: [], checked: [], halfChecked: [] };

    const checked: number[] = [];
    const halfChecked: number[] = [];

    // Recursively build children nodes.
    const buildChildren = (node: API.SysMenu, nodes: API.SysMenu[]) => {
        let children: API.SysMenu[] | undefined;
        let selectedChildCount = 0;
        nodes.forEach((o) => {
            if (o.parentId === node.id) {
                if (children === undefined) children = [];
                children.push(buildChildren(o, nodes));

                if (selectedSet && selectedSet.has(o.id)) selectedChildCount++;
            }
        });
        node.children = children;
        if (selectedSet?.has(node.id)) {
            if (children && selectedChildCount != 0 && selectedChildCount < children.length) {
                halfChecked.push(node.id);
            } else {
                checked.push(node.id);
            }
        }

        return node;
    };

    const menuTree: API.SysMenu[] = [];
    nodes.forEach((item) => {
        if (item.parentId == 0) menuTree.push(buildChildren(item, nodes));
    });

    return { tree: menuTree, checked, halfChecked };
};
