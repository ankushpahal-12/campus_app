const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Production: Temporarily leak stack traces to solve this "next is not a function" bug
        res.status(err.statusCode || 500).json({
            status: err.status || 'error',
            message: err.message,
            stack: err.stack
        });
    }

};

module.exports = errorMiddleware;
