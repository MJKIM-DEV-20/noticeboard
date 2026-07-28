// src/routes/routes.tsx
import { type RouteObject, Navigate } from 'react-router-dom';
import { PATHS } from './path';
import Layout from "../layout/layout.tsx";
import Home from "../pages/home.tsx";
import Login from '../pages/Login';
import Signup from '../pages/signup';
import MyPage from "../pages/mypage.tsx";
import PostList from '../pages/PostList';
import PostDetail from '../pages/postdetail';
import PostForm from '../components/postform';
import ProtectedRoute from './protectedrouter';

export const routes: RouteObject[] = [
    {
        element: <Layout />,
        children: [
            { path: PATHS.HOME, element: <Home /> },
            { path: PATHS.LOGIN, element: <Login /> },
            { path: PATHS.SIGNUP, element: <Signup /> },
            {
                path: PATHS.MYPAGE,
                element: (
                    <ProtectedRoute>
                        <MyPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: PATHS.POSTS,
                children: [
                    { index: true, element: <PostList /> },
                    {
                        path: 'new',
                        element: (
                            <ProtectedRoute>
                                <PostForm />
                            </ProtectedRoute>
                        ),
                    },
                    { path: ':id', element: <PostDetail /> },
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
            { path: '*', element: <Navigate to={PATHS.HOME} replace /> },
        ],
    },
];