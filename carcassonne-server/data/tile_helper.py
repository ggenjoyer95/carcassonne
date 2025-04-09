import json
import os
import pyperclip

def convert_coords(coord_string):
    """
    Принимает строку с координатами в формате "0,0,4,5,6,7",
    округляет до 2 знаков и возвращает список точек вида [[x1, y1], [x2, y2], ...].
    """
    parts = coord_string.strip().split(",")
    if len(parts) % 2 != 0:
        raise ValueError("Неверное число координат. Ожидается четное число значений.")
    points = []
    for i in range(0, len(parts), 2):
        x = round(float(parts[i]) / 500.0, 2)
        y = round(float(parts[i+1]) / 500.0, 2)
        points.append([x, y])
    return points

def format_polygon(points):
    """
    Форматирует список точек в строку вида:
    [
        [0.3, 0.4],
        [0.7, 0.4],
        [0.7, 0.6],
        [0.3, 0.6]
    ]
    """
    formatted_lines = ["["]
    for point in points:
        formatted_lines.append("    " + str(point) + ",")
    formatted_lines[-1] = formatted_lines[-1].rstrip(",")
    formatted_lines.append("]")
    return "\n".join(formatted_lines)

def rotate_point(pt):
    """
    Поворачивает точку pt (x, y) на 90° по часовой стрелке относительно центра (0.5, 0.5).
    Формула: new_x = y, new_y = 1 - x.
    """
    x, y = pt
    new_x = y
    new_y = 1 - x
    return [round(new_x, 2), round(new_y, 2)]

def rotate_polygon(polygon):
    """
    Поворачивает полигоны, применяя поворот для каждой точки.
    """
    return [rotate_point(pt) for pt in polygon]

def rotate_edges(edges, rotation_count):
    """
    Поворачивает список ребер тайла. Для каждого ребра новое значение "edge" 
    вычисляется как (старый номер + rotation_count) mod 4. Результирующий список
    сортируется по номеру ребра.
    """
    rotated_edges = []
    for edge in edges:
        # Предполагаем, что в каждом ребре значение "edge" (номер стороны) определено
        new_edge = (edge['edge'] + rotation_count) % 4
        new_edge_obj = edge.copy()
        new_edge_obj['edge'] = new_edge
        rotated_edges.append(new_edge_obj)
    return sorted(rotated_edges, key=lambda e: e['edge'])

def rotate_tile(tile, rotation_count):
    """
    Поворачивает тайл на rotation_count * 90°.
    Для свойства "edges" используется функция rotate_edges.
    Для каждого полигона в "areas" применяется функция rotate_polygon.
    Остальные свойства просто копируются.
    """
    new_tile = {}
    for key, value in tile.items():
        if key == 'edges':
            new_tile['edges'] = rotate_edges(value, rotation_count)
        elif key == 'areas':
            new_areas = []
            for area in value:
                new_area = area.copy()
                if 'polygon' in new_area and isinstance(new_area['polygon'], list):
                    new_area['polygon'] = rotate_polygon(new_area['polygon'])
                # Если поле "coords" еще осталось, его можно удалить или обновить
                new_areas.append(new_area)
            new_tile['areas'] = new_areas
        else:
            new_tile[key] = value
    new_tile['rotation'] = rotation_count * 90  # Добавляем информацию о повороте, если нужно
    return new_tile

def process_tile_definitions(tiles):
    """
    Обходит все тайлы, преобразует координаты в полигоны и генерирует повёрнутые варианты.
    Если у тайла с именем, оканчивающимся на "0", отсутствуют варианты с 1,2,3, генерирует их.
    """
    updated_tiles = {}
    # Сначала обходим все тайлы и конвертируем "coords" -> "polygon" (если есть)
    for tile_name, tile in tiles.items():
        if 'areas' in tile:
            for area in tile['areas']:
                if 'coords' in area and isinstance(area['coords'], str):
                    try:
                        points = convert_coords(area['coords'])
                        area['polygon'] = points
                        del area['coords']
                    except Exception as e:
                        print(f"Ошибка конвертации coords для тайла {tile_name}, области {area.get('name','')}: {e}")
        updated_tiles[tile_name] = tile

    # Затем для тайлов с именами, оканчивающимися на "0", генерируем варианты поворота 1-3,
    # если таких еще нет
    base_names = {}
    for tile_name in updated_tiles.keys():
        if tile_name.endswith("0"):
            base_name = tile_name[:-1]
            base_names[base_name] = updated_tiles[tile_name]

    for base_name, base_tile in base_names.items():
        for i in [1, 2, 3]:
            new_name = base_name + str(i)
            if new_name not in updated_tiles:
                rotated_tile = rotate_tile(base_tile, i)
                updated_tiles[new_name] = rotated_tile
                print(f"Создан тайл {new_name} путем поворота {i*90}° от {base_name}0")
    return updated_tiles

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(base_dir, "tileDefinitions.json")
    output_file = os.path.join(base_dir, "tileDefinitions_updated.json")
    
    with open(input_file, "r", encoding="utf-8") as f:
        tiles = json.load(f)
    print(f"Loaded {len(tiles)} tiles from {input_file}")
    
    updated_tiles = process_tile_definitions(tiles)
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(updated_tiles, f, indent=2, ensure_ascii=False)
    
    print(f"Обновленные определения тайлов сохранены в {output_file}")

if __name__ == '__main__':
    main()