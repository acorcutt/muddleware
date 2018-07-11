module.exports = function muddleware(...handlers) {
    return function middleware(req, res, next) {

        // If running outside of express middleware then you may not have 'next' so ensure we have a final call and handle any error
        function final(err) {
            if (next) {
                // If we are in a chain then pass to next
                return next(err);
            } else if (err) {
                // Ensure 'err' is an Error object for google cloud functions
                if (err instanceof Error) {
                    throw err;
                } else {
                    throw new Error(err);
                }
            }
        }

        function handle(err) {
            // Handle errors passed through next(err)
            if (err) {
                return final(err);
            }

            // Get and remove the handler from the stack
            var handler = handlers.shift();

            if (!handler) {
                return final();
            }

            // Call the handler with recursive next call to next handler catching any uncaught errors
            try {
                handler(req, res, handle);
            } catch (e) {
                final(e);
            }
        }

        handle();
    };
}