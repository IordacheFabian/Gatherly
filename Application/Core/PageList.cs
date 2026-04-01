using System;

namespace Application.Core;

public class PageList<T, TCusor>
{
    public List<T> Items { get; set; } = [];
    public TCusor? NextCursor { get; set; }
} 
