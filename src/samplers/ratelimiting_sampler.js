// @flow
// Copyright (c) 2016 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import * as constants from '../constants.js';
import RateLimiter from '../rate_limiter.js';

export default class RateLimitingSampler {
    _rateLimiter: RateLimiter;
    _maxTracesPerSecond: number;

    constructor(maxTracesPerSecond: number) {
        if (maxTracesPerSecond < 0) {
            throw new Error(`maxTracesPerSecond must be greater than 0.0.  Received ${maxTracesPerSecond}`);
        }

        this._maxTracesPerSecond = maxTracesPerSecond;
        this._rateLimiter = new RateLimiter(maxTracesPerSecond);
    }

    name(): string {
        return 'RateLimitingSampler';
    }

    toString(): string {
        return `${this.name()}(maxTracesPerSecond=${this._maxTracesPerSecond})`;
    }

    get maxTracesPerSecond(): number {
        return this._maxTracesPerSecond;
    }

    isSampled(operation: string, tags: any): boolean {
        let decision = this._rateLimiter.checkCredit(1.0);
        if (decision) {
            tags[constants.SAMPLER_TYPE_TAG_KEY] = constants.SAMPLER_TYPE_RATE_LIMITING;
            tags[constants.SAMPLER_PARAM_TAG_KEY] = this._maxTracesPerSecond;
        }
        return decision;
    }

    equal(other: Sampler): boolean {
        if (!(other instanceof RateLimitingSampler)) {
            return false;
        }

        return this.maxTracesPerSecond === other.maxTracesPerSecond;
    }

    close(callback: Function): void {
        if (callback) {
            callback();
        }
    }
}
