// src/routes/routes.tsx
import {type RouteObject, Navigate } from 'react-router-dom';
import { PATHS } from './path';
import Login from '../pages/Login';
import PostList from "../pages/PostList.tsx";
import PostDetail from "../pages/postdetail.tsx";
import ProtectedRoute from "./protectedrouter.tsx";
import PostForm from "../components/postform.tsx";
import Signup from "../pages/signup.tsx";

export const routes: RouteObject[] = [
    {
        path: PATHS.HOME,
        element: <Navigate to={PATHS.POSTS} replace />,
    },
    {
        path: PATHS.LOGIN,
        element: <Login />,
    },
    {
        path: PATHS.SIGNUP,
        element: <Signup />,
    },
    {
        path: PATHS.POSTS,
        children: [
            {
                index: true,
                element: <PostList />,
            },
            {
                path: 'new',
                element: (
                    <ProtectedRoute>
                        <PostForm />
                    </ProtectedRoute>
                ),
            },
            {
                path: ':id',
                element: <PostDetail />,
            },
            {
                path: ':id/edit',
                element: (
                    <ProtectedRoute>
                        <PostForm />
                    </ProtectedRoute>
                ),
            },
        ],
    },
    {
        path: '*',
        element: <Navigate to={PATHS.POSTS} replace />,
    },
];