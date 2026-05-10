import { Routes } from "@angular/router";
import { HomeMenu } from "./features/pages/home-menu/home-menu";
import { FileSection } from "./features/pages/file-section/file-section";
import { Layout } from "./shared/components/layout/layout";

export const routes: Routes = [
    { path: "", redirectTo: "home", pathMatch: "full"},

    {
        path: "",
        component: Layout,
        children: [
            { path: "home", component: HomeMenu },
            { path: "file-section/:name/:id", component: FileSection}
        ]
    }
];
