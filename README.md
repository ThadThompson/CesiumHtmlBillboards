# Cesium HTML Billboards

This is an example implementation of map aligned HTML elements for Cesium including automatic repositioning, and horizon occlusion. 

It should be noted that using HTML billboards is a trade-off between significantly more flexibility - you can use the full power of HTML and CSS for styling - and performance. This is really useful for a small number of rich information or interaction tags. However, trying to render 1000 HTML elements is going to yield disappointing performance vs the built-in Cesium Billboard object.

## Prerequisites
This expects you to put a Cesium build in the lib/Cesium directory.

## Implementation Notes:
Positioning is handled by setting the _top_ and _left_ style properties. My original approach was to use the translate3D style, which seems to be slightly smoother. However, when building many elements, this was causing Chrome to generate a layer per element which caused a massive hit during compositing. 

Culling is handled by removing elements from the DOM. For a small number of elements, it might be better to just set their visibility to 'hidden'.
