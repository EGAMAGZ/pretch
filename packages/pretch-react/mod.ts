/**
 * # @pretch/react
 *
 * An implementation of `@pretch/core` for react. These hooks create a custom
 * fetch function with optional enhancements to track request status. {@link useFetch}
 * will automatically fetch data when the component is mounted, while {@link useLazyFetch}
 * will fetch when manually triggered.
 *
 * ## Features
 * - Compatible with all JavaScript runtimes (Node.js, Bun, Deno) and browser environments
 * - Type-safe response handling
 * - Request enhancement capabilities
 * - Automatic and manual fetching modes
 * - Built-in loading and error states
 * - Support for request middleware
 *
 * ### Automatic Fetching
 * ```tsx
 * import { useFetch } from "@pretch/react";
 * import { useState, useEffect } from "react";
 *
 * const randomNumber = () => Math.floor(Math.random() * 10) + 1;
 * type User = { name: string; username: string; email: string; };
 *
 * function RandomUser() {
 *     const [userId, setUserId] = useState(randomNumber());
 *     const { data, loading, error, refetch } = useFetch<User>(`https://jsonplaceholder.typicode.com/users/${userId}`);
 *
 *     useEffect(() => {
 *         refetch({newUrl:`https://jsonplaceholder.typicode.com/users/${userId}`});
 *     }, [userId]);
 *
 *     const handleClick= () => { setUserId(randomNumber())};
 *
 *     if (loading) return <div>Loading...</div>
 *
 *     if (error) return <div>Error while fetching ...</div>
 *
 *     return (
 *         <div>
 *             <p>
 *                 Username: {data?.username}<br/>
 *                 Name: {data?.name}<br/>
 *                 Email: {data?.email}
 *             </p>
 *             <button onClick={handleClick}>Get random user</button>
 *         </div>
 *     );
 * }
 * ```
 *
 * ### Manual Fetching
 * ```tsx
 * import { useLazyFetch } from "@pretch/react";
 * import { useState } from "react";
 *
 * function UpdateTodo(){
 *     const [completed,setCompleted] = useState(false);
 *     const {data, fetchData, error, loading} = useLazyFetch({url:"https://jsonplaceholder.typicode.com/todos/1"});
 *
 *     const handleClick = () => {
 *         setCompleted((c:boolean) => !c);
 *
 *         fetchData({
 *             newOptions:{
 *                 method: "PUT",
 *                 body: JSON.stringify({completed})
 *             }
 *         });
 *     };
 *     return (
 *         <div>
 *             <span>Task to be done</span>
 *             <button onClick={handleClick} disabled={loading}>
 *                 {completed ? "Complete" : "Not complete"}
 *             </button>
 *         </div>
 *     );
 * }
 * ```
 *
 * ## Advanced Usage
 *
 * ### Using Middleware
 * ```tsx
 * import { useLazyFetch } from '@pretch/react';
 * import { applyMiddleware, authorization, retry } from '@pretch/core/middleware';
 *
 * function SecureComponent() {
 *     const { data } = useLazyFetch({
 *         url: 'https://api.example.com/secure',
 *         enhancer: applyMiddleware(
 *             authorization('your-token', 'bearer'),
 *             retry({ maxRetries: 3 })
 *         ),
 *     });
 *
 *     return <div>render data: {JSON.stringify(data)}</div>;
 * }
 * ```
 *
 * ### Custom Enhancers
 * ```tsx
 * import { useFetch } from '@pretch/react';
 * import type { Enhancer, Handler } from '@pretch/core';
 *
 * const loggingEnhancer: Enhancer = (handler: Handler) => {
 *     return async (request: Request) => {
 *         console.log('Request:', request.url);
 *         const response = await handler(request);
 *         console.log('Response:', response.status);
 *         return response;
 *     };
 * };
 *
 * function LoggedComponent() {
 *     const { data } = useFetch('https://api.example.com', {
 *         enhancer: loggingEnhancer
 *     });
 *
 *     return <div>render data: {JSON.stringify(data)}</div>;
 * }
 * ```
 *
 * ## API Reference
 *
 * The package exports two main hooks:
 *
 * ### useFetch<T>
 * Creates a fetch hook that automatically executes on component mount.
 * {@link useFetch}
 *
 * ### useLazyFetch<T>
 * Creates a fetch hook that only executes when manually triggered.
 * {@link useLazyFetch}
 *
 * @module
 */
export { useFetch } from "@/hooks/use_fetch.ts";
export { useLazyFetch } from "@/hooks/use_lazy_fetch.ts";
export * from "@/types.ts";
