import { ReactNode } from "react";

interface MenuListItem {
    btn_title: string;
    btn_icon: ReactNode;
    btn_link: string;
    roles?: string[];
}
export interface MenuSidebarDashboard {

    title: string;
    btn_title: string;
    btn_icon: ReactNode;
    list: MenuListItem[];

}