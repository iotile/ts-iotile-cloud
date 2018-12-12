'use strict';

import { ApiFilter } from '../../src/models/apifilter';

describe('ApiFilter', () => {

  it('check ApiFilter add filter', () => {
    let filter: ApiFilter = new ApiFilter();
    filter.addFilter('foo', 'bar');
    filter.addFilter('abc', '5');
    expect(filter.filterString()).toEqual('?foo=bar&abc=5');
  });

  it('check ApiFilter add same filter', () => {
    let filter: ApiFilter = new ApiFilter();
    filter.addFilter('foo', 'bar');
    filter.addFilter('abc', '5');
    filter.addFilter('abc', '9');
    expect(filter.filterString()).toEqual('?foo=bar&abc=5&abc=9');
  });

  it('check ApiFilter remove filter', () => {
    let filter: ApiFilter = new ApiFilter();
    filter.addFilter('foo', 'bar');
    filter.addFilter('abc', '5');
    filter.removeFilter('foo');
    expect(filter.filterString()).toEqual('?abc=5');
  });

  it('check ApiFilter remove filter does not exist', () => {
    let filter: ApiFilter = new ApiFilter();
    filter.addFilter('foo', 'bar');
    filter.addFilter('abc', '5');
    filter.removeFilter('def');
    expect(filter.filterString()).toEqual('?foo=bar&abc=5');
  });

  it('check ApiFilter add unique filter', () => {
    let filter: ApiFilter = new ApiFilter();
    filter.addFilter('foo', 'bar');
    filter.addFilter('abc', '5');
    filter.addFilter('abc', '9', true);
    expect(filter.filterString()).toEqual('?foo=bar&abc=9');
  });

  it('check ApiFilter get filter', () => {
    let filter: ApiFilter = new ApiFilter();
    filter.addFilter('foo', 'bar');
    let value = filter.getFilter('foo');
    expect(value).toEqual('bar');
  });

  it('check ApiFilter get undefined filter', () => {
    let filter: ApiFilter = new ApiFilter();
    let value = filter.getFilter('foo');
    expect(value).not.toBeDefined();
  });

  it('check ApiFilter copy filter', () => {
    let filter: ApiFilter = new ApiFilter();
    filter.addFilter('foo', 'bar');
    filter.addFilter('abc', '5');
    filter.addFilter('abc', '9', true);
    let new_filter = filter.copy();
    expect(filter.filterString()).toEqual('?foo=bar&abc=9');
    expect(new_filter.filterString()).toEqual('?foo=bar&abc=9');
    
    new_filter.addFilter('diverge', 'new_info');
    filter.removeFilter('foo');
    expect(filter.filterString()).toEqual('?abc=9');
    expect(new_filter.filterString()).toEqual('?foo=bar&abc=9&diverge=new_info');
  });

});